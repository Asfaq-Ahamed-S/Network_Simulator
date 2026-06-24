import { useState } from "react";
import {
  PORT_MAP,
  getPortInfo,
  getVersionsForService,
  getDefaultVersion,
  getRiskForVersion,
  getNodeRisk,
} from "../utils/portDatabase"

// ── Style Constants ──────────────────────────────────────────────
const inp  = "w-full bg-gray-800 border border-gray-600 text-white text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-500";
const lbl  = "text-xs text-gray-400 mb-1 block";
const sect = "border-t border-gray-700 pt-3 mt-3 space-y-3";

const TAG_COLOR = {
  pc: "bg-blue-700", server: "bg-indigo-700", router: "bg-orange-700",
  switch: "bg-green-700", hub: "bg-purple-700", firewall: "bg-red-700",
  ids: "bg-yellow-600", waf: "bg-pink-700", ap: "bg-teal-700",
  cloud: "bg-sky-700", vpn: "bg-violet-700",
};
const TAG_LABEL = {
  pc: "PC", server: "Server", router: "Router", switch: "Switch",
  hub: "Hub", firewall: "Firewall", ids: "IDS/IPS", waf: "WAF",
  ap: "Access Point", cloud: "Cloud", vpn: "VPN Gateway",
};

// ── Firewall ACL Editor ──────────────────────────────────────────
function FirewallACL({ rules = [], defaultPolicy = "deny", onRules, onPolicy }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ srcIp: "any", dstIp: "any", port: "any", protocol: "TCP", action: "ALLOW" });

  const add = () => {
    onRules([...rules, { ...form, id: Date.now() }]);
    setForm({ srcIp: "any", dstIp: "any", port: "any", protocol: "TCP", action: "ALLOW" });
    setOpen(false);
  };

  const remove = (id) => onRules(rules.filter((r) => r.id !== id));

  return (
    <div className="space-y-3">
      <div>
        <label className={lbl}>Default Policy</label>
        <div className="flex gap-2">
          {["allow", "deny"].map((p) => (
            <button key={p} onClick={() => onPolicy(p)}
              className={`flex-1 text-xs py-1 rounded font-bold uppercase ${
                defaultPolicy === p
                  ? p === "deny" ? "bg-red-700 text-white" : "bg-green-700 text-white"
                  : "bg-gray-700 text-gray-400"}`}>
              {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">Applied to traffic that matches no rule.</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className={lbl + " mb-0"}>ACL Rules</label>
          <button onClick={() => setOpen(!open)}
            className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-white">
            {open ? "Cancel" : "+ Add Rule"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-2">Evaluated top-down. First match wins.</p>

        {rules.length === 0 && !open && (
          <p className="text-xs text-gray-500 italic">No rules. Default policy handles all traffic.</p>
        )}

        {rules.map((r, i) => (
          <div key={r.id} className="flex items-center justify-between bg-gray-800 rounded px-2 py-1 mb-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">#{i + 1}</span>
              <span className={`font-bold ${r.action === "ALLOW" ? "text-green-400" : "text-red-400"}`}>{r.action}</span>
              <span className="text-gray-300">src:{r.srcIp} → dst:{r.dstIp}</span>
              <span className="text-blue-300">port:{r.port} {r.protocol}</span>
            </div>
            <button onClick={() => remove(r.id)} className="text-red-500 hover:text-red-300 ml-2">✕</button>
          </div>
        ))}

        {open && (
          <div className="bg-gray-800 border border-gray-600 rounded p-2 space-y-2 mt-1">
            <div className="flex gap-1">
              <input type="text" placeholder="Src IP (any)" value={form.srcIp}
                onChange={(e) => setForm({ ...form, srcIp: e.target.value })}
                className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
              <input type="text" placeholder="Dst IP (any)" value={form.dstIp}
                onChange={(e) => setForm({ ...form, dstIp: e.target.value })}
                className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
            </div>
            <div className="flex gap-1">
              <input type="text" placeholder="Port (any/80)" value={form.port}
                onChange={(e) => setForm({ ...form, port: e.target.value })}
                className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
              <select value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1">
                <option>TCP</option><option>UDP</option><option>ICMP</option><option>ANY</option>
              </select>
              <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}
                className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1">
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
              </select>
            </div>
            <button onClick={add}
              className="w-full bg-green-700 hover:bg-green-600 text-white text-xs rounded py-1">
              Add Rule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Port Editor constants ────────────────────────────────────────
const RISK_DOT = {
  safe:     "bg-green-400",
  moderate: "bg-yellow-400",
  high:     "bg-orange-400",
  critical: "bg-red-500",
}
const RISK_TEXT = {
  safe:     "text-green-400",
  moderate: "text-yellow-400",
  high:     "text-orange-400",
  critical: "text-red-400",
}
const RISK_LABEL = {
  safe:     "Safe",
  moderate: "Moderate",
  high:     "High Risk",
  critical: "Critical",
}
const STATE_COLOR = {
  open:     "text-green-400",
  closed:   "text-gray-500",
  filtered: "text-yellow-400",
}

// ── Port Editor (Server nodes) ───────────────────────────────────
function PortEditor({ ports = [], onChange }) {
  const [open,        setOpen]        = useState(false)
  const [selPort,     setSelPort]     = useState("")
  const [selVersion,  setSelVersion]  = useState("")
  const [portState,   setPortState]   = useState("open")
  const [versionOpen, setVersionOpen] = useState(false)

  const portInfo = selPort ? getPortInfo(Number(selPort)) : null
  const versions = portInfo ? getVersionsForService(portInfo.service) : []
  const selVerObj = versions.find(v => v.version === selVersion)

  const handlePortChange = (e) => {
    const num = e.target.value
    setSelPort(num)
    setSelVersion("")
    setVersionOpen(false)
    if (num) {
      const info = getPortInfo(Number(num))
      if (info) {
        const def = getDefaultVersion(info.service)
        if (def) setSelVersion(def.version)
      }
    }
  }

  const add = () => {
    if (!selPort || !portInfo) return
    if (ports.some(p => p.port === Number(selPort))) return
    const risk = getRiskForVersion(portInfo.service, selVersion)
    onChange([...ports, {
      id:          Date.now(),
      port:        Number(selPort),
      protocol:    portInfo.protocol,
      service:     portInfo.service,
      description: portInfo.description,
      version:     selVersion,
      risk,
      state:       portState,
    }])
    setSelPort("")
    setSelVersion("")
    setPortState("open")
    setOpen(false)
  }

  const remove = (id) => onChange(ports.filter(p => p.id !== id))
  const nodeRisk = getNodeRisk(ports)

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={lbl + " mb-0"}>Open Ports / Services</span>
          {ports.length > 0 && (
            <span className={`text-xs font-bold ${RISK_TEXT[nodeRisk]}`}>
              ● {RISK_LABEL[nodeRisk]}
            </span>
          )}
        </div>
        <button onClick={() => setOpen(!open)}
          className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-white">
          {open ? "Cancel" : "+ Add Port"}
        </button>
      </div>

      {ports.length === 0 && !open && (
        <p className="text-xs text-gray-500 italic">No open ports — host is dark.</p>
      )}

      {ports.map(p => {
        const cves = getVersionsForService(p.service)
          .find(v => v.version === p.version)?.cves || []
        return (
          <div key={p.id} className="bg-gray-800 rounded px-2 py-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT[p.risk] || "bg-gray-400"}`} />
                <span className="font-mono text-green-400 text-xs">{p.port}/{p.protocol}</span>
                <span className="text-white text-xs font-medium">{p.service}</span>
                <span className={`text-xs ${STATE_COLOR[p.state]}`}>[{p.state}]</span>
              </div>
              <button onClick={() => remove(p.id)} className="text-red-500 hover:text-red-300 text-xs ml-2">✕</button>
            </div>
            {p.version && (
              <p className={`text-xs pl-4 ${RISK_TEXT[p.risk]}`}>{p.version}</p>
            )}
            {cves.length > 0 && (
              <div className="pl-4 space-y-0.5">
                {cves.map(c => (
                  <p key={c.id} className="text-xs">
                    <span className="font-mono text-red-400">{c.id}</span>
                    <span className="text-gray-500"> — {c.summary}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {open && (
        <div className="bg-gray-800 border border-gray-600 rounded p-2 space-y-2">
          <div>
            <label className={lbl}>Port Number</label>
            <select value={selPort} onChange={handlePortChange} className={inp}>
              <option value="">Select a port…</option>
              {PORT_MAP.map(p => (
                <option key={p.port} value={p.port}>
                  {p.port} — {p.service} ({p.protocol}) · {p.description}
                </option>
              ))}
            </select>
          </div>

          {portInfo && (
            <div className="bg-gray-700/50 rounded px-2 py-1.5 text-xs space-y-0.5">
              <div className="flex gap-4">
                <span className="text-gray-400">Service: <span className="text-white font-medium">{portInfo.service}</span></span>
                <span className="text-gray-400">Protocol: <span className="text-blue-300">{portInfo.protocol}</span></span>
              </div>
              <p className="text-gray-500">{portInfo.description}</p>
            </div>
          )}

          {portInfo && versions.length > 0 && (
            <div>
              <label className={lbl}>Version</label>
              <div className="relative">
                <button type="button" onClick={() => setVersionOpen(!versionOpen)}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5 flex items-center justify-between">
                  {selVerObj ? (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${RISK_DOT[selVerObj.risk]}`} />
                      <span className={RISK_TEXT[selVerObj.risk]}>{selVerObj.version}</span>
                      <span className="text-gray-500">— {RISK_LABEL[selVerObj.risk]}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select version…</span>
                  )}
                  <span className="text-gray-400 ml-2">{versionOpen ? "▴" : "▾"}</span>
                </button>

                {versionOpen && (
                  <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-52 overflow-y-auto shadow-2xl">
                    <div className="flex gap-3 px-2 py-1.5 border-b border-gray-700 flex-wrap">
                      {Object.entries(RISK_LABEL).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${RISK_DOT[k]}`} />
                          <span className="text-gray-400 text-xs">{v}</span>
                        </div>
                      ))}
                    </div>
                    {versions.map(v => (
                      <div key={v.version}
                        onClick={() => { setSelVersion(v.version); setVersionOpen(false) }}
                        className="px-2 py-1.5 cursor-pointer hover:bg-gray-700 border-b border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${RISK_DOT[v.risk]}`} />
                          <span className={`text-xs ${RISK_TEXT[v.risk]}`}>{v.version}</span>
                          <span className="text-gray-500 text-xs">— {RISK_LABEL[v.risk]}</span>
                        </div>
                        {v.cves?.length > 0 && (
                          <div className="pl-4 mt-0.5">
                            {v.cves.map(c => (
                              <p key={c.id} className="text-xs text-red-400/80 font-mono">{c.id}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className={lbl}>Port State</label>
            <div className="flex gap-1">
              {["open", "closed", "filtered"].map(s => (
                <button key={s} onClick={() => setPortState(s)}
                  className={`flex-1 text-xs py-1 rounded capitalize ${
                    portState === s
                      ? s === "open"     ? "bg-green-700 text-white"
                      : s === "filtered" ? "bg-yellow-700 text-white"
                      :                    "bg-gray-600 text-white"
                      : "bg-gray-700 text-gray-400"}`}>
                  {s}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {portState === "open"     && "Accepting connections — visible to scanners."}
              {portState === "closed"   && "Reachable but no service listening — RST returned."}
              {portState === "filtered" && "Firewall dropping packets — scanner gets no response."}
            </p>
          </div>

          <button onClick={add} disabled={!selPort || !portInfo}
            className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs rounded py-1">
            Add Port
          </button>
        </div>
      )}
    </div>
  )
}

// ── Routing Table Editor ─────────────────────────────────────────
function RoutingTable({ routes = [], interfaces = [], onChange }) {
  const emptyForm = { destination: "", prefix: "24", gateway: "", iface: "", metric: "1" }
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  // Derive connected routes from configured interfaces (read-only rows)
  const connectedRoutes = interfaces
    .filter(i => i.subnet && i.subnet.trim())
    .map(i => {
      const [dest, prefix] = i.subnet.includes("/")
        ? i.subnet.split("/")
        : [i.subnet, "?"]
      return { destination: dest.trim(), prefix, iface: i.name, connected: true }
    })

  const add = () => {
    if (!form.destination || !form.gateway) return
    onChange([...routes, { ...form, id: Date.now() }])
    setForm(emptyForm)
    setOpen(false)
  }

  const remove = (id) => onChange(routes.filter(r => r.id !== id))

  const hasRows = connectedRoutes.length > 0 || routes.length > 0

  return (
    <div className="space-y-2">

      {/* Header */}
      <div className="flex justify-between items-center">
        <label className={lbl + " mb-0"}>Routing Table</label>
        <button onClick={() => setOpen(!open)}
          className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-white">
          {open ? "Cancel" : "+ Add Route"}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Longest-prefix match. Connected routes are auto-derived from interfaces.
      </p>

      {/* Empty state */}
      {!hasRows && !open && (
        <p className="text-xs text-gray-500 italic">
          No routes. Configure interfaces above to auto-populate connected routes.
        </p>
      )}

      {/* Column headers */}
      {hasRows && (
        <div className="grid text-xs text-gray-500 font-medium px-2 py-0.5"
          style={{ gridTemplateColumns: "1fr 2rem 1fr 2.5rem 1.5rem" }}>
          <span>Destination</span>
          <span className="text-center">Pfx</span>
          <span>Gateway</span>
          <span>Iface</span>
          <span className="text-center">M</span>
        </div>
      )}

      {/* Connected routes — greyed, read-only */}
      {connectedRoutes.map((r, i) => (
        <div key={`conn-${i}`}
          className="grid items-center bg-gray-800/40 border border-gray-700/40 rounded px-2 py-1 opacity-60"
          style={{ gridTemplateColumns: "1fr 2rem 1fr 2.5rem 1.5rem" }}
          title="Auto-derived from interface subnet">
          <span className="font-mono text-xs text-gray-400 truncate">{r.destination}</span>
          <span className="text-xs text-gray-500 text-center">/{r.prefix}</span>
          <span className="text-xs text-gray-500 italic">Connected</span>
          <span className="font-mono text-xs text-green-400/70 truncate">{r.iface}</span>
          <span className="text-xs text-gray-500 text-center">0</span>
        </div>
      ))}

      {/* Static routes */}
      {routes.map(r => (
        <div key={r.id}
          className="grid items-center bg-gray-800 border border-gray-700 rounded px-2 py-1 group"
          style={{ gridTemplateColumns: "1fr 2rem 1fr 2.5rem 1.5rem 1rem" }}>
          <span className="font-mono text-xs text-white truncate">{r.destination}</span>
          <span className="text-xs text-gray-400 text-center">/{r.prefix}</span>
          <span className="font-mono text-xs text-blue-300 truncate">{r.gateway}</span>
          <span className="font-mono text-xs text-green-400 truncate">{r.iface}</span>
          <span className="text-xs text-gray-400 text-center">{r.metric}</span>
          <button onClick={() => remove(r.id)}
            className="text-red-500 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            ✕
          </button>
        </div>
      ))}

      {/* Add form */}
      {open && (
        <div className="bg-gray-800 border border-gray-600 rounded p-2 space-y-2 mt-1">

          {/* Destination + prefix */}
          <div className="flex gap-1 items-end">
            <div className="flex-1">
              <label className={lbl}>Destination Network</label>
              <input type="text" value={form.destination}
                onChange={e => setForm({ ...form, destination: e.target.value })}
                placeholder="192.168.2.0"
                className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5" />
            </div>
            <div className="w-14">
              <label className={lbl}>/ Prefix</label>
              <input type="text" value={form.prefix}
                onChange={e => setForm({ ...form, prefix: e.target.value })}
                placeholder="24"
                className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5" />
            </div>
          </div>

          {/* Gateway */}
          <div>
            <label className={lbl}>Next-Hop Gateway</label>
            <input type="text" value={form.gateway}
              onChange={e => setForm({ ...form, gateway: e.target.value })}
              placeholder="192.168.1.1"
              className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5" />
          </div>

          {/* Interface + metric */}
          <div className="flex gap-1 items-end">
            <div className="flex-1">
              <label className={lbl}>Egress Interface</label>
              <select value={form.iface}
                onChange={e => setForm({ ...form, iface: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5">
                <option value="">— none —</option>
                {interfaces.map(i => (
                  <option key={i.id} value={i.name}>{i.name}{i.ip ? ` (${i.ip})` : ""}</option>
                ))}
              </select>
            </div>
            <div className="w-16">
              <label className={lbl}>Metric</label>
              <input type="number" value={form.metric} min="1" max="255"
                onChange={e => setForm({ ...form, metric: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1.5" />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Use <span className="font-mono text-gray-300">0.0.0.0</span> / <span className="font-mono text-gray-300">0</span> for a default route.
          </p>

          <button onClick={add}
            disabled={!form.destination || !form.gateway}
            className="w-full bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-xs rounded py-1">
            Add Route
          </button>
        </div>
      )}
    </div>
  )
}

// ── VLANConfig ───────────────────────────────────────────────

function VLANConfig({ node, edges, nodes, onUpdate }) {
  const [newVlanId, setNewVlanId] = useState('');
  const [newVlanName, setNewVlanName] = useState('');

  const vlans = node.data.vlans || [];
  const portConfig = node.data.portConfig || {};

  // Ports derived from actual topology — NOT manually typed
  const connectedEdges = edges.filter(
    e => e.source === node.id || e.target === node.id
  );

  const getNeighborLabel = (edge) => {
    const neighborId = edge.source === node.id ? edge.target : edge.source;
    const neighbor = nodes.find(n => n.id === neighborId);
    return neighbor?.data?.label || `Node ${neighborId}`;
  };

  const addVlan = () => {
    const id = parseInt(newVlanId);
    if (!id || id < 1 || id > 4094) return;
    if (vlans.find(v => v.id === id)) return;
    onUpdate({ vlans: [...vlans, { id, name: newVlanName.trim() || `VLAN${id}` }] });
    setNewVlanId('');
    setNewVlanName('');
  };

  const removeVlan = (vlanId) => {
    onUpdate({ vlans: vlans.filter(v => v.id !== vlanId) });
  };

  const getPortCfg = (edgeId) =>
    portConfig[edgeId] || { mode: 'access', vlan: vlans[0]?.id ?? null, allowedVlans: [] };

  const updatePort = (edgeId, changes) => {
    onUpdate({
      portConfig: {
        ...portConfig,
        [edgeId]: { ...getPortCfg(edgeId), ...changes },
      },
    });
  };

  const toggleTrunkVlan = (edgeId, vlanId, checked) => {
    const cfg = getPortCfg(edgeId);
    const current = cfg.allowedVlans || [];
    const updated = checked
      ? [...current, vlanId]
      : current.filter(id => id !== vlanId);
    updatePort(edgeId, { allowedVlans: updated });
  };

  return (
    <div className="space-y-4">

      {/* ── VLAN List ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          VLANs Defined
        </p>

        {vlans.length === 0 && (
          <p className="text-xs text-gray-500 italic mb-2">No VLANs defined.</p>
        )}

        <div className="space-y-1 mb-3">
          {vlans.map(v => (
            <div
              key={v.id}
              className="flex items-center justify-between bg-gray-800 px-3 py-1.5 rounded text-sm"
            >
              <span className="text-cyan-400 font-mono w-16">VLAN {v.id}</span>
              <span className="text-gray-300 flex-1">{v.name}</span>
              <button
                onClick={() => removeVlan(v.id)}
                className="text-red-400 hover:text-red-300 text-xs ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add VLAN row */}
        <div className="flex gap-2">
          <input
            type="number"
            min="1"
            max="4094"
            placeholder="ID"
            value={newVlanId}
            onChange={e => setNewVlanId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addVlan()}
            className="w-16 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <input
            type="text"
            placeholder="Name (optional)"
            value={newVlanName}
            onChange={e => setNewVlanName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addVlan()}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={addVlan}
            className="bg-cyan-700 hover:bg-cyan-600 text-white text-xs px-3 py-1 rounded"
          >
            Add
          </button>
        </div>
      </div>

      {/* ── Port Configuration ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Port Configuration
        </p>

        {connectedEdges.length === 0 ? (
          <p className="text-xs text-gray-500 italic">
            No connected ports — draw connections first.
          </p>
        ) : (
          <div className="space-y-3">
            {connectedEdges.map(edge => {
              const cfg = getPortCfg(edge.id);
              return (
                <div
                  key={edge.id}
                  className="bg-gray-800 rounded p-3 border border-gray-700 space-y-2"
                >
                  {/* Port header: neighbor label + mode selector */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-300 font-mono truncate">
                      ⇒ {getNeighborLabel(edge)}
                    </span>
                    <select
                      value={cfg.mode}
                      onChange={e =>
                        updatePort(edge.id, {
                          mode: e.target.value,
                          vlan: vlans[0]?.id ?? null,
                          allowedVlans: [],
                        })
                      }
                      className="bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none ml-2"
                    >
                      <option value="access">Access</option>
                      <option value="trunk">Trunk</option>
                    </select>
                  </div>

                  {/* Access mode: single VLAN dropdown */}
                  {cfg.mode === 'access' && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">VLAN:</span>
                      {vlans.length === 0 ? (
                        <span className="text-xs text-yellow-500 italic">
                          Define a VLAN above first
                        </span>
                      ) : (
                        <select
                          value={cfg.vlan ?? ''}
                          onChange={e =>
                            updatePort(edge.id, { vlan: parseInt(e.target.value) })
                          }
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                        >
                          {vlans.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.id} — {v.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Trunk mode: allowed VLANs checkboxes */}
                  {cfg.mode === 'trunk' && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Allowed VLANs:</p>
                      {vlans.length === 0 ? (
                        <span className="text-xs text-yellow-500 italic">
                          Define VLANs above first
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {vlans.map(v => (
                            <label
                              key={v.id}
                              className="flex items-center gap-1 text-xs text-gray-300 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(cfg.allowedVlans || []).includes(v.id)}
                                onChange={e =>
                                  toggleTrunkVlan(edge.id, v.id, e.target.checked)
                                }
                                className="accent-cyan-500"
                              />
                              VLAN {v.id}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
export default function PropertiesPanel({ node, onUpdate, onClose, networkState, edges = [], nodes = [] }) {
  if (!node) return null;

  const data = node.data;
  const dt   = data.deviceType;
  console.log("deviceType:", dt)
  const set  = (field, value) => onUpdate(node.id, { ...data, [field]: value });

  const updateIface = (idx, patch) => {
    const ifaces = [...(data.interfaces || [])];
    ifaces[idx]  = { ...ifaces[idx], ...patch };
    set("interfaces", ifaces);
  };

  const toggleWafRule = (key, checked) => {
    const cur = data.wafRules || [];
    set("wafRules", checked ? [...cur, key] : cur.filter((r) => r !== key));
  };

  return (
    <div className="w-72 bg-gray-900 border-l border-gray-700 h-full overflow-y-auto flex flex-col text-white">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${TAG_COLOR[dt] || "bg-gray-700"}`}>
            {TAG_LABEL[dt] || dt}
          </span>
          <span className="text-sm font-semibold truncate max-w-[130px]">{data.name}</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-lg leading-none">✕</button>
      </div>

      <div className="p-4 space-y-3 flex-1">

        {/* Name — all devices */}
        <div>
          <label className={lbl}>Device Name</label>
          <input className={inp} value={data.name || ""} onChange={(e) => set("name", e.target.value)} />
        </div>

        {/* ── PC ── */}
        {dt.toLowerCase() === "pc" && (<>
          <div><label className={lbl}>IP Address</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="192.168.1.10" /></div>
          <div><label className={lbl}>Hostname</label>
            <input className={inp} value={data.hostname || ""} onChange={(e) => set("hostname", e.target.value)} placeholder="workstation-1" /></div>
          <div><label className={lbl}>Operating System</label>
            <select className={inp} value={data.os || "linux"} onChange={(e) => set("os", e.target.value)}>
              <option value="linux">Linux</option>
              <option value="windows">Windows</option>
              <option value="mac">macOS</option>
            </select></div>
          <div className={sect}>
            <PortEditor ports={data.ports || []} onChange={(v) => set("ports", v)} />
          </div>
        </>)}

        {/* ── SERVER ── */}
        {dt.toLowerCase() === "server" && (<>
          <div><label className={lbl}>IP Address</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="192.168.1.20" /></div>
          <div><label className={lbl}>Hostname</label>
            <input className={inp} value={data.hostname || ""} onChange={(e) => set("hostname", e.target.value)} placeholder="web-server-01" /></div>
          <div><label className={lbl}>Operating System</label>
            <select className={inp} value={data.os || "linux"} onChange={(e) => set("os", e.target.value)}>
              <option value="linux">Linux</option>
              <option value="windows-server">Windows Server</option>
            </select></div>
          <div className={sect}>
            <PortEditor ports={data.ports || []} onChange={(v) => set("ports", v)} />
          </div>
        </>)}

        {/* ── ROUTER ── */}
        {dt.toLowerCase() === "router" && (<>
          <div><label className={lbl}>Hostname</label>
            <input className={inp} value={data.hostname || ""} onChange={(e) => set("hostname", e.target.value)} placeholder="core-router-1" /></div>

          {/* Interfaces */}
          <div className={sect}>
            <div className="flex justify-between items-center">
              <label className={lbl + " mb-0"}>Interfaces</label>
              <button onClick={() => set("interfaces", [...(data.interfaces || []),
                { id: Date.now(), name: `eth${(data.interfaces||[]).length}`, ip: "", subnet: "" }])}
                className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-white">+ Add</button>
            </div>
            <p className="text-xs text-gray-500">Each interface connects to one subnet.</p>
            {(data.interfaces || []).length === 0 && (
              <p className="text-xs text-gray-500 italic">No interfaces yet.</p>
            )}
            {(data.interfaces || []).map((iface, idx) => (
              <div key={iface.id} className="bg-gray-800 rounded p-2 space-y-1 mt-1">
                <div className="flex gap-1 items-center">
                  <input type="text" value={iface.name} placeholder="eth0"
                    onChange={(e) => updateIface(idx, { name: e.target.value })}
                    className="w-14 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
                  <input type="text" value={iface.ip} placeholder="IP address"
                    onChange={(e) => updateIface(idx, { ip: e.target.value })}
                    className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
                  <button onClick={() => set("interfaces", (data.interfaces||[]).filter(i => i.id !== iface.id))}
                    className="text-red-500 hover:text-red-300 text-xs">✕</button>
                </div>
                <input type="text" value={iface.subnet} placeholder="192.168.1.0/24"
                  onChange={(e) => updateIface(idx, { subnet: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
              </div>
            ))}
          </div>

          {/* Routing Table */}
          <div className={sect}>
            <RoutingTable
              routes={data.routes || []}
              interfaces={data.interfaces || []}
              onChange={(v) => set("routes", v)}
            />
          </div>
        </>)}

        {/* ── SWITCH ── */}
        {dt.toLowerCase() === "switch" && (<>
          <div><label className={lbl}>Management IP</label>
            <input className={inp} value={data.managementIp || ""} onChange={(e) => set("managementIp", e.target.value)} placeholder="192.168.1.2" /></div>
          <div className={sect}>
            <p className="text-xs text-gray-400 leading-relaxed">
              Layer 2 device. Forwards Ethernet frames using MAC address tables. Does not route between subnets.
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              VLAN Configuration
            </p>
            <VLANConfig
              node={node}
              edges={edges}
              nodes={nodes}
              onUpdate={(changes)=> {
                Object.entries(changes).forEach(([k, v]) => set(k, v));
              }}
            />
          </div>
        </>)}

        {/* ── HUB ── */}
        {dt.toLowerCase() === "hub" && (
          <div className={sect}>
            <p className="text-xs text-gray-400 leading-relaxed">Dumb repeater. Broadcasts every frame to all ports — no filtering, no intelligence.</p>
            <p className="text-xs text-yellow-400 mt-2">⚠ All connected hosts can capture each other's traffic. Serious sniffing risk.</p>
          </div>
        )}

        {/* ── FIREWALL ── */}
        {dt.toLowerCase() === "firewall" && (<>
          <div><label className={lbl}>Management IP</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="192.168.1.254" /></div>
          <div className={sect}>
            <FirewallACL
              rules={data.rules || []}
              defaultPolicy={data.defaultPolicy || "deny"}
              onRules={(v) => set("rules", v)}
              onPolicy={(v) => set("defaultPolicy", v)}
            />
          </div>
        </>)}

        {/* ── IDS/IPS ── */}
        {dt.toLowerCase() === "ids" && (<>
          <div>
            <label className={lbl}>Mode</label>
            <div className="flex gap-2">
              {["IDS", "IPS"].map((m) => (
                <button key={m} onClick={() => set("mode", m)}
                  className={`flex-1 text-xs py-1.5 rounded font-bold ${data.mode === m ? "bg-yellow-600 text-white" : "bg-gray-700 text-gray-400"}`}>
                  {m}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.mode === "IPS"
                ? "IPS: Inline. Detects and actively drops suspicious traffic."
                : "IDS: Passive. Detects and logs — traffic still passes through."}
            </p>
          </div>
          <div className={sect}>
            <label className={lbl}>Scan Detection Sensitivity</label>
            <div className="flex gap-1">
              {["low", "medium", "high"].map((s) => (
                <button key={s} onClick={() => set("sensitivity", s)}
                  className={`flex-1 text-xs py-1 rounded capitalize ${data.sensitivity === s ? "bg-red-700 text-white" : "bg-gray-700 text-gray-400"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500 space-y-1">
              <p><span className="text-gray-300">Low —</span> triggers on <span className="font-mono text-yellow-300">nmap -A</span> only</p>
              <p><span className="text-gray-300">Medium —</span> triggers on <span className="font-mono text-yellow-300">-A</span>, <span className="font-mono text-yellow-300">-sS</span></p>
              <p><span className="text-gray-300">High —</span> triggers on any nmap scan</p>
            </div>
          </div>
        </>)}

        {/* ── WAF ── */}
        {dt.toLowerCase() === "waf" && (<>
          <div><label className={lbl}>Management IP</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="192.168.1.252" /></div>
          <div className={sect}>
            <label className={lbl}>Active Filter Rules</label>
            <p className="text-xs text-gray-500 mb-2">WAF only inspects HTTP/HTTPS traffic (ports 80, 443).</p>
            {[
              { key: "sqli",          label: "SQL Injection"               },
              { key: "xss",           label: "Cross-Site Scripting (XSS)"  },
              { key: "csrf",          label: "CSRF Protection"             },
              { key: "rfi",           label: "Remote File Inclusion"       },
              { key: "pathtraversal", label: "Path Traversal"              },
              { key: "cmdinject",     label: "Command Injection"           },
            ].map((rule) => (
              <label key={rule.key} className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer py-0.5">
                <input type="checkbox"
                  checked={(data.wafRules || []).includes(rule.key)}
                  onChange={(e) => toggleWafRule(rule.key, e.target.checked)}
                  className="accent-pink-500" />
                {rule.label}
              </label>
            ))}
          </div>
        </>)}

        {/* ── ACCESS POINT ── */}
        {dt.toLowerCase() === "ap" && (<>
          <div><label className={lbl}>SSID</label>
            <input className={inp} value={data.ssid || ""} onChange={(e) => set("ssid", e.target.value)} placeholder="CorpNetwork" /></div>
          <div>
            <label className={lbl}>Encryption</label>
            <select className={inp} value={data.encryption || "WPA2"} onChange={(e) => set("encryption", e.target.value)}>
              <option value="Open">Open (no encryption)</option>
              <option value="WEP">WEP (crackable)</option>
              <option value="WPA">WPA (deprecated)</option>
              <option value="WPA2">WPA2</option>
              <option value="WPA3">WPA3</option>
            </select>
            {data.encryption === "Open" && <p className="text-xs text-red-400 mt-1">⚠ All wireless traffic is plaintext.</p>}
            {data.encryption === "WEP"  && <p className="text-xs text-red-400 mt-1">⚠ Crackable in under a minute with aircrack-ng.</p>}
            {data.encryption === "WPA"  && <p className="text-xs text-yellow-400 mt-1">⚠ Deprecated. Vulnerable to TKIP attacks.</p>}
          </div>
          <div><label className={lbl}>Frequency Band</label>
            <select className={inp} value={data.frequency || "2.4GHz"} onChange={(e) => set("frequency", e.target.value)}>
              <option value="2.4GHz">2.4 GHz (longer range, more interference)</option>
              <option value="5GHz">5 GHz (faster, shorter range)</option>
              <option value="dual">Dual Band</option>
            </select></div>
          <div><label className={lbl}>Management IP</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="192.168.1.1" /></div>
        </>)}

        {/* ── CLOUD ── */}
        {dt.toLowerCase() === "cloud" && (<>
          <div><label className={lbl}>Provider / Label</label>
            <input className={inp} value={data.label || ""} onChange={(e) => set("label", e.target.value)} placeholder="AWS / Internet / Azure" /></div>
          <div><label className={lbl}>IP Range</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="0.0.0.0/0" /></div>
          <div className={sect}>
            <p className="text-xs text-gray-400 leading-relaxed">
              Represents external internet or a cloud provider. Traffic reaching this node is outside your network perimeter.
            </p>
          </div>
        </>)}

        {/* ── VPN GATEWAY ── */}
        {dt.toLowerCase() === "vpn" && (<>
          <div><label className={lbl}>Public IP</label>
            <input className={inp} value={data.ip || ""} onChange={(e) => set("ip", e.target.value)} placeholder="203.0.113.1" /></div>
          <div><label className={lbl}>VPN Protocol</label>
            <select className={inp} value={data.protocol || "IPSec"} onChange={(e) => set("protocol", e.target.value)}>
              <option value="IPSec">IPSec</option>
              <option value="OpenVPN">OpenVPN</option>
              <option value="WireGuard">WireGuard</option>
              <option value="L2TP">L2TP/IPSec</option>
            </select></div>
          <div><label className={lbl}>Authentication</label>
            <select className={inp} value={data.auth || "psk"} onChange={(e) => set("auth", e.target.value)}>
              <option value="psk">Pre-Shared Key (PSK)</option>
              <option value="certificate">Certificate</option>
              <option value="radius">RADIUS</option>
            </select></div>
          <div className={sect}>
            <p className="text-xs text-gray-400 leading-relaxed">
              Encrypted tunnel endpoint. Intermediate nodes cannot inspect traffic passing through this VPN.
            </p>
          </div>
        </>)}

      </div>
    </div>
  );
}
