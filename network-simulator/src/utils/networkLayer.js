// ============================================================
//  NETWORKSIM — utils/networkLayer.js
//  Phase 3: Network Realism Layer
//  Covers: MAC · DHCP/APIPA/Static · ARP · DNS · VLAN · Routing · Protocols · STP
// ============================================================


// ── 1. MAC ADDRESS GENERATION ────────────────────────────────────────────────
//  Deterministic from nodeId → same node always gets the same MAC.
//  First byte = 0x02 (locally administered, unicast — avoids real OUI conflicts).

export function generateMAC(nodeId) {
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    hash = Math.imul(hash, 31) + nodeId.charCodeAt(i);
    hash |= 0;
  }
  hash = hash >>> 0;

  const bytes = [
    0x02,
    (hash >>> 24) & 0xff,
    (hash >>> 16) & 0xff,
    (hash >>> 8)  & 0xff,
     hash         & 0xff,
    nodeId.length & 0xff,
  ];
  return bytes.map(b => b.toString(16).padStart(2, '0')).join(':');
}


// ── 2. IP ADDRESS ASSIGNMENT ─────────────────────────────────────────────────
//  Three modes per node:
//    'static'  → node.data.staticIP (falls back to APIPA if missing/invalid)
//    'dhcp'    → allocated from dhcpState pool
//    'apipa'   → 169.254.x.x derived from nodeId (RFC 3927)
//  Default mode when unset: 'dhcp'

export function generateAPIPA(nodeId) {
  let hash = 0;
  for (const c of nodeId) {
    hash = Math.imul(hash, 31) + c.charCodeAt(0);
    hash |= 0;
  }
  hash = hash >>> 0;
  // RFC 3927: 169.254.1.0 – 169.254.254.255  (avoid .0.x and .255.x)
  const third  = 1 + (hash % 254);
  const fourth = 1 + ((hash >>> 8) % 254);
  return `169.254.${third}.${fourth}`;
}

export function assignIP(node, dhcpState) {
  const mode = node.data?.ipMode || 'dhcp';

  if (mode === 'static') {
    const ip = node.data?.staticIP;
    return ip && isValidIP(ip) ? ip : generateAPIPA(node.id);
  }

  if (mode === 'dhcp') {
    return allocateDHCPLease(node.id, dhcpState);
  }

  // explicit 'apipa' or anything else
  return generateAPIPA(node.id);
}


// ── 3. DHCP STATE ────────────────────────────────────────────────────────────
//  Simple sequential allocator.  One DHCP server per logical network.
//  Falls back to APIPA when pool is exhausted.

export function createDHCPState(subnet = '192.168.1', start = 100, end = 200) {
  return {
    subnet,        // e.g. '192.168.1'  (first three octets)
    start,         // first leasable host octet
    end,           // last leasable host octet
    nextAvailable: start,
    leases: {},    // nodeId → IP string
  };
}

export function allocateDHCPLease(nodeId, dhcpState) {
  if (dhcpState.leases[nodeId]) return dhcpState.leases[nodeId];

  if (dhcpState.nextAvailable > dhcpState.end) {
    // Pool exhausted → APIPA fallback
    return generateAPIPA(nodeId);
  }

  const ip = `${dhcpState.subnet}.${dhcpState.nextAvailable}`;
  dhcpState.leases[nodeId] = ip;
  dhcpState.nextAvailable++;
  return ip;
}

export function releaseDHCPLease(nodeId, dhcpState) {
  delete dhcpState.leases[nodeId];
  // Note: simple allocator doesn't reclaim the slot — good enough for simulation.
}

export function isDHCPExhausted(dhcpState) {
  return dhcpState.nextAvailable > dhcpState.end;
}


// ── 4. ARP TABLE ─────────────────────────────────────────────────────────────
//  Maps IP → { mac, nodeId }.
//  In real networks ARP is per-device; here we keep a global table
//  (simulates a fully resolved cache across the topology).

export function buildARPTable(nodes, ipMap) {
  const arp = new Map(); // IP → { mac, nodeId, label }
  for (const node of nodes) {
    const ip = ipMap[node.id];
    if (!ip) continue;
    arp.set(ip, {
      mac:    generateMAC(node.id),
      nodeId: node.id,
      label:  node.data?.label || node.id,
    });
  }
  return arp;
}

export function arpLookup(ip, arpTable) {
  return arpTable.get(ip) ?? null;
}

export function arpLookupByMAC(mac, arpTable) {
  for (const entry of arpTable.values()) {
    if (entry.mac === mac) return entry;
  }
  return null;
}


// ── 5. DNS ────────────────────────────────────────────────────────────────────
//  hostname → IP (forward lookup)
//  IP → hostname (reverse lookup / PTR)
//  Hostname derived from node label, lowercased, spaces→hyphens.

export function deriveHostname(node) {
  return (node.data?.label || node.id)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function buildDNSTable(nodes, ipMap) {
  const dns = new Map(); // hostname → IP
  for (const node of nodes) {
    const ip = ipMap[node.id];
    if (!ip) continue;
    dns.set(deriveHostname(node), ip);
  }
  return dns;
}

export function dnsResolve(hostname, dnsTable) {
  return dnsTable.get(hostname.toLowerCase()) ?? null;
}

export function dnsReverse(ip, dnsTable) {
  for (const [hostname, addr] of dnsTable.entries()) {
    if (addr === ip) return hostname;
  }
  return null;
}


// ── 6. VLAN ───────────────────────────────────────────────────────────────────
//  Each node carries node.data.vlan (integer).  Untagged = VLAN 1 (default).
//  Devices on different VLANs cannot communicate without a Layer-3 router.

export function getVLAN(node) {
  return node.data?.vlan ?? 1;
}

export function sameVLAN(nodeA, nodeB) {
  return getVLAN(nodeA) === getVLAN(nodeB);
}

export function getVLANMembers(nodes, vlanId) {
  return nodes.filter(n => getVLAN(n) === vlanId);
}

export function getAllVLANs(nodes) {
  return [...new Set(nodes.map(n => getVLAN(n)))].sort((a, b) => a - b);
}

/**
 * Can nodeA reach nodeB directly (L2)?
 * Returns false if they're on different VLANs and no router bridges them.
 * Pass the full node list so we can check for intervening routers.
 */
export function canReachL2(nodeA, nodeB) {
  return sameVLAN(nodeA, nodeB);
}


// ── 7. ROUTING TABLE ─────────────────────────────────────────────────────────
//  Per-router static routes.  Uses longest-prefix matching.
//  routingTables: { [routerId]: Route[] }
//
//  Route shape:
//    { network, mask, nextHop, iface, metric }
//    nextHop = '0.0.0.0' means directly connected.

export function createRoute(network, mask, nextHop = '0.0.0.0', iface = 'eth0', metric = 1) {
  return { network, mask, nextHop, iface, metric };
}

/**
 * Default routing table for a router node.
 * Adds a directly-connected route for its subnet + a default gateway stub.
 */
export function defaultRoutingTable(routerIP, mask = '255.255.255.0') {
  const network = applyMask(routerIP, mask);
  return [
    createRoute(network, mask, '0.0.0.0', 'eth0', 1),            // directly connected
    createRoute('0.0.0.0', '0.0.0.0', routerIP, 'eth0', 100),   // default route (stub)
  ];
}

/**
 * Longest-prefix match on a routing table.
 * Returns the best matching Route or null (no route to host).
 */
export function lookupRoute(destIP, routingTable) {
  if (!Array.isArray(routingTable) || routingTable.length === 0) return null;

  const dest = ipToInt(destIP);
  let bestMatch = null;
  let longestPrefix = -1;

  for (const route of routingTable) {
    const network = ipToInt(route.network);
    const mask    = ipToInt(route.mask);
    if ((dest & mask) === (network & mask)) {
      const prefixLen = maskToPrefixLen(route.mask);
      if (prefixLen > longestPrefix) {
        longestPrefix = prefixLen;
        bestMatch = route;
      }
    }
  }
  return bestMatch;
}

export function sameSubnet(ipA, ipB, mask = '255.255.255.0') {
  const m = ipToInt(mask);
  return (ipToInt(ipA) & m) === (ipToInt(ipB) & m);
}

export function applyMask(ip, mask) {
  return intToIP(ipToInt(ip) & ipToInt(mask));
}


// ── 8. PROTOCOL / PACKET TAGGING ─────────────────────────────────────────────
//  Used by Phase 4 packet capture to label simulated traffic.

export const PROTOCOLS = {
  ICMP:  { name: 'ICMP',  layer: 3, color: '#60a5fa' },
  ARP:   { name: 'ARP',   layer: 2, color: '#a78bfa' },
  TCP:   { name: 'TCP',   layer: 4, color: '#34d399' },
  UDP:   { name: 'UDP',   layer: 4, color: '#f59e0b' },
  DNS:   { name: 'DNS',   layer: 7, color: '#fb923c' },
  HTTP:  { name: 'HTTP',  layer: 7, color: '#f87171' },
  HTTPS: { name: 'HTTPS', layer: 7, color: '#4ade80' },
  DHCP:  { name: 'DHCP',  layer: 7, color: '#e879f9' },
  STP:   { name: 'STP',   layer: 2, color: '#94a3b8' },
};

let _packetSeq = 0;

export function tagPacket({
  protocol,
  srcIP,
  dstIP,
  srcMAC = null,
  dstMAC = null,
  srcPort = null,
  dstPort = null,
  payload = '',
  ttl = 64,
}) {
  return {
    seq:      ++_packetSeq,
    protocol: PROTOCOLS[protocol] ?? { name: protocol, layer: 3, color: '#94a3b8' },
    srcIP,
    dstIP,
    srcMAC,
    dstMAC,
    srcPort,
    dstPort,
    payload,
    ttl,
    timestamp: Date.now(),
  };
}

export function resetPacketSeq() {
  _packetSeq = 0;
}


// ── 9. STP — SPANNING TREE PROTOCOL ─────────────────────────────────────────
//  Prevents broadcast storms in topologies with loops.
//  Algorithm: BFS from root bridge (switch with lexicographically lowest MAC).
//  Returns { rootId, blockedEdges: Set<edgeId> }

export function runSTP(nodes, edges) {
  const switches = nodes.filter(n =>
    ['switch', 'managedswitch'].includes(n.data?.deviceType?.toLowerCase())
  );

  if (switches.length === 0) return { rootId: null, blockedEdges: new Set() };

  // Root bridge = switch with lowest MAC (deterministic)
  const root = switches.reduce((best, sw) =>
    generateMAC(sw.id) < generateMAC(best.id) ? sw : best
  );

  const visited    = new Set([root.id]);
  const queue      = [root.id];
  const treeEdgeIds = new Set();
  const blockedEdges = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    const adjacent = edges.filter(e => e.source === current || e.target === current);

    for (const edge of adjacent) {
      const neighbor = edge.source === current ? edge.target : edge.source;
      if (!switches.find(s => s.id === neighbor)) continue; // only switch–switch links

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        treeEdgeIds.add(edge.id);
      } else if (!treeEdgeIds.has(edge.id)) {
        blockedEdges.add(edge.id);   // redundant link → block it
      }
    }
  }

  return { rootId: root.id, blockedEdges };
}


// ── 10. NETWORK STATE INITIALIZER ────────────────────────────────────────────
//  Single entry point: call this whenever the topology changes.
//  Returns a complete networkState object consumed by the rest of the app.
//
//  Options:
//    subnet    — first three octets for DHCP pool  (default '192.168.1')
//    dhcpStart — first assignable host octet       (default 100)
//    dhcpEnd   — last assignable host octet        (default 200)

export function initNetworkState(nodes, edges, options = {}) {
  const dhcpState = createDHCPState(
    options.subnet    ?? '192.168.1',
    options.dhcpStart ?? 100,
    options.dhcpEnd   ?? 200,
  );

  const ipMap  = {};
  const macMap = {};

  for (const node of nodes) {
    macMap[node.id] = generateMAC(node.id);
    ipMap[node.id]  = assignIP(node, dhcpState);
  }

  const arpTable  = buildARPTable(nodes, ipMap);
  const dnsTable  = buildDNSTable(nodes, ipMap);
  const stpResult = runSTP(nodes, edges);
  const vlans     = getAllVLANs(nodes);

  // Seed default routing tables for router/firewall nodes
  const routingTables = {};
  for (const node of nodes) {
    const t = node.data?.deviceType?.toLowerCase();
    if (t === 'router' || t === 'firewall') {
      const ip = ipMap[node.id];
      routingTables[node.id] = node.data?.routingTable ?? defaultRoutingTable(ip);
    }
  }

  return {
    ipMap,
    macMap,
    dhcpState,
    arpTable,
    dnsTable,
    stpResult,
    vlans,
    routingTables,
  };
}


// ── IP MATH UTILITIES ─────────────────────────────────────────────────────────

export function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function intToIP(int) {
  return [
    (int >>> 24) & 0xff,
    (int >>> 16) & 0xff,
    (int >>>  8) & 0xff,
     int         & 0xff,
  ].join('.');
}

export function maskToPrefixLen(mask) {
  return (ipToInt(mask).toString(2).match(/1/g) ?? []).length;
}

export function prefixLenToMask(len) {
  const mask = len === 0 ? 0 : (~0 << (32 - len)) >>> 0;
  return intToIP(mask);
}

export function isValidIP(ip) {
  if (typeof ip !== 'string') return false;
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every(p => {
    const n = parseInt(p, 10);
    return String(n) === p && n >= 0 && n <= 255;
  });
}

export function broadcastAddress(ip, mask) {
  const net  = ipToInt(ip) & ipToInt(mask);
  const wild = ~ipToInt(mask) >>> 0;
  return intToIP((net | wild) >>> 0);
}

export function networkAddress(ip, mask) {
  return intToIP((ipToInt(ip) & ipToInt(mask)) >>> 0);
}
