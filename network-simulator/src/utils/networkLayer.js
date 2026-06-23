// ============================================================
//  NETWORKSIM — utils/networkLayer.js
//  Phase 3: Network Realism Layer
//  Covers: MAC · DHCP/APIPA/Static · ARP · DNS · VLAN · Routing · Protocols · STP
//  + CAM table (Switch only) · per-device ARP cache
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

  return generateAPIPA(node.id);
}


// ── 3. DHCP STATE ────────────────────────────────────────────────────────────

export function createDHCPState(subnet = '192.168.1', start = 100, end = 200) {
  return {
    subnet,
    start,
    end,
    nextAvailable: start,
    leases: {},
  };
}

export function allocateDHCPLease(nodeId, dhcpState) {
  if (dhcpState.leases[nodeId]) return dhcpState.leases[nodeId];

  if (dhcpState.nextAvailable > dhcpState.end) {
    return generateAPIPA(nodeId);
  }

  const ip = `${dhcpState.subnet}.${dhcpState.nextAvailable}`;
  dhcpState.leases[nodeId] = ip;
  dhcpState.nextAvailable++;
  return ip;
}

export function releaseDHCPLease(nodeId, dhcpState) {
  delete dhcpState.leases[nodeId];
}

export function isDHCPExhausted(dhcpState) {
  return dhcpState.nextAvailable > dhcpState.end;
}


// ── 4. ARP TABLE (global — used by ping/pathfinder) ──────────────────────────
//  Maps IP → { mac, nodeId, label }.
//  Represents a fully-resolved cache across the whole topology.
//  Per-device ARP caches (realistic, neighbor-only) are built separately below.

export function buildARPTable(nodes, ipMap) {
  const arp = new Map();
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


// ── 4b. PER-DEVICE ARP CACHE ─────────────────────────────────────────────────
//  Each IP-capable device only learns MACs of its directly connected neighbors.
//  This is how real ARP works: you only cache what you've talked to.
//
//  arpCaches: { [nodeId]: Map<IP, { mac, neighborId }> }

const IP_CAPABLE_TYPES = new Set([
  'pc', 'server', 'router', 'firewall', 'ap', 'vpn', 'cloud', 'ids', 'waf',
]);

/**
 * Build the ARP cache for a single IP-capable node.
 * Scans every edge attached to the node, resolves the neighbor's IP + MAC,
 * and stores the mapping.
 */
export function buildARPCache(node, edges, nodes, ipMap, macMap) {
  const cache = new Map(); // IP → { mac, neighborId, label }

  const attachedEdges = edges.filter(
    e => e.source === node.id || e.target === node.id
  );

  for (const edge of attachedEdges) {
    const neighborId = edge.source === node.id ? edge.target : edge.source;
    const neighbor   = nodes.find(n => n.id === neighborId);
    if (!neighbor) continue;

    const ip  = ipMap[neighborId];
    const mac = macMap[neighborId];
    if (!ip || !mac) continue;

    cache.set(ip, {
      mac,
      neighborId,
      label: neighbor.data?.label || neighborId,
    });
  }

  return cache;
}

/**
 * Build ARP caches for all IP-capable nodes in the topology.
 * Returns { [nodeId]: Map<IP, { mac, neighborId, label }> }
 */
export function buildAllARPCaches(nodes, edges, ipMap, macMap) {
  const caches = {};
  for (const node of nodes) {
    const t = node.data?.deviceType?.toLowerCase();
    if (IP_CAPABLE_TYPES.has(t)) {
      caches[node.id] = buildARPCache(node, edges, nodes, ipMap, macMap);
    }
  }
  return caches;
}


// ── 5. CAM TABLE (Switch nodes only) ────────────────────────────────────────
//  Content-Addressable Memory: MAC → { port, neighborId }
//  In a real switch, the CAM table is learned dynamically when frames arrive.
//  Here we pre-populate it from the topology (each edge = one port).
//
//  port: edge.id — uniquely identifies which physical port the MAC is reachable on.
//
//  camTables: { [switchId]: Map<MAC, { port, neighborId, label }> }

const SWITCH_TYPES = new Set(['switch', 'managedswitch']);

/**
 * Build the CAM table for a single switch node.
 * Every directly connected neighbor gets one MAC→port entry.
 */
export function buildCAMTable(switchNode, edges, nodes, macMap) {
  const cam = new Map(); // MAC → { port, neighborId, label }

  const attachedEdges = edges.filter(
    e => e.source === switchNode.id || e.target === switchNode.id
  );

  for (const edge of attachedEdges) {
    const neighborId = edge.source === switchNode.id ? edge.target : edge.source;
    const neighbor   = nodes.find(n => n.id === neighborId);
    if (!neighbor) continue;

    const mac = macMap[neighborId];
    if (!mac) continue;

    cam.set(mac, {
      port:       edge.id,   // edge ID acts as the port identifier
      neighborId,
      label:      neighbor.data?.label || neighborId,
    });
  }

  return cam;
}

/**
 * Build CAM tables for all switch nodes in the topology.
 * Returns { [switchId]: Map<MAC, { port, neighborId, label }> }
 */
export function buildAllCAMTables(nodes, edges, macMap) {
  const tables = {};
  for (const node of nodes) {
    const t = node.data?.deviceType?.toLowerCase();
    if (SWITCH_TYPES.has(t)) {
      tables[node.id] = buildCAMTable(node, edges, nodes, macMap);
    }
  }
  return tables;
}

/**
 * Look up which port a MAC is reachable on for a given switch.
 * Returns the entry ({ port, neighborId, label }) or null if unknown.
 * Unknown MAC → switch floods to all ports (standard behavior).
 */
export function camLookup(mac, camTable) {
  return camTable.get(mac) ?? null;
}


// ── 6. DNS ────────────────────────────────────────────────────────────────────

export function deriveHostname(node) {
  return (node.data?.label || node.id)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
}

export function buildDNSTable(nodes, ipMap) {
  const dns = new Map();
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


// ── 7. VLAN ───────────────────────────────────────────────────────────────────

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

export function canReachL2(nodeA, nodeB) {
  return sameVLAN(nodeA, nodeB);
}


// ── 8. ROUTING TABLE ─────────────────────────────────────────────────────────

export function createRoute(network, mask, nextHop = '0.0.0.0', iface = 'eth0', metric = 1) {
  return { network, mask, nextHop, iface, metric };
}

export function defaultRoutingTable(routerIP, mask = '255.255.255.0') {
  const network = applyMask(routerIP, mask);
  return [
    createRoute(network, mask, '0.0.0.0', 'eth0', 1),
    createRoute('0.0.0.0', '0.0.0.0', routerIP, 'eth0', 100),
  ];
}

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


// ── 9. PROTOCOL / PACKET TAGGING ─────────────────────────────────────────────

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
  protocol, srcIP, dstIP,
  srcMAC = null, dstMAC = null,
  srcPort = null, dstPort = null,
  payload = '', ttl = 64,
}) {
  return {
    seq:      ++_packetSeq,
    protocol: PROTOCOLS[protocol] ?? { name: protocol, layer: 3, color: '#94a3b8' },
    srcIP, dstIP, srcMAC, dstMAC, srcPort, dstPort, payload, ttl,
    timestamp: Date.now(),
  };
}

export function resetPacketSeq() { _packetSeq = 0; }


// ── 10. STP — SPANNING TREE PROTOCOL ─────────────────────────────────────────

export function runSTP(nodes, edges) {
  const switches = nodes.filter(n =>
    SWITCH_TYPES.has(n.data?.deviceType?.toLowerCase())
  );

  if (switches.length === 0) return { rootId: null, blockedEdges: new Set() };

  const root = switches.reduce((best, sw) =>
    generateMAC(sw.id) < generateMAC(best.id) ? sw : best
  );

  const visited      = new Set([root.id]);
  const queue        = [root.id];
  const treeEdgeIds  = new Set();
  const blockedEdges = new Set();

  while (queue.length > 0) {
    const current  = queue.shift();
    const adjacent = edges.filter(e => e.source === current || e.target === current);

    for (const edge of adjacent) {
      const neighbor = edge.source === current ? edge.target : edge.source;
      if (!switches.find(s => s.id === neighbor)) continue;

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        treeEdgeIds.add(edge.id);
      } else if (!treeEdgeIds.has(edge.id)) {
        blockedEdges.add(edge.id);
      }
    }
  }

  return { rootId: root.id, blockedEdges };
}


// ── 11. NETWORK STATE INITIALIZER ────────────────────────────────────────────
//  Single entry point — call whenever topology changes.
//  Now includes:
//    camTables  — per-switch CAM tables  (MAC → port)
//    arpCaches  — per-device ARP caches  (IP  → MAC, neighbors only)

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

  const arpTable  = buildARPTable(nodes, ipMap);       // global (ping / pathfinder)
  const arpCaches = buildAllARPCaches(nodes, edges, ipMap, macMap); // per-device
  const camTables = buildAllCAMTables(nodes, edges, macMap);        // Switch only
  const dnsTable  = buildDNSTable(nodes, ipMap);
  const stpResult = runSTP(nodes, edges);
  const vlans     = getAllVLANs(nodes);

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
    arpTable,      // global IP→MAC (used by existing ping)
    arpCaches,     // per-device IP→MAC (Phase 4 packet capture, ping v2)
    camTables,     // per-switch MAC→port (Phase 4 frame forwarding simulation)
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
