import { useState } from "react";

// ── Service Presets ──────────────────────────────────────────────
const SERVICE_PRESETS = [
  { name: "SSH",        port: 22,    protocol: "TCP" },
  { name: "Telnet",     port: 23,    protocol: "TCP" },
  { name: "FTP",        port: 21,    protocol: "TCP" },
  { name: "HTTP",       port: 80,    protocol: "TCP" },
  { name: "HTTPS",      port: 443,   protocol: "TCP" },
  { name: "SMB",        port: 445,   protocol: "TCP" },
  { name: "RDP",        port: 3389,  protocol: "TCP" },
  { name: "MySQL",      port: 3306,  protocol: "TCP" },
  { name: "PostgreSQL", port: 5432,  protocol: "TCP" },
  { name: "MongoDB",    port: 27017, protocol: "TCP" },
  { name: "Redis",      port: 6379,  protocol: "TCP" },
  { name: "DNS",        port: 53,    protocol: "UDP" },
  { name: "SMTP",       port: 25,    protocol: "TCP" },
  { name: "SNMP",       port: 161,   protocol: "UDP" },
  { name: "LDAP",       port: 389,   protocol: "TCP" },
  { name: "NFS",        port: 2049,  protocol: "TCP" },
];

// ── Service Versions ─────────────────────────────────────────────
const SERVICE_VERSIONS = {
  SSH: [
    { version: "OpenSSH 9.3",       status: "safe"       },
    { version: "OpenSSH 8.9",       status: "safe"       },
    { version: "OpenSSH 8.2",       status: "safe"       },
    { version: "OpenSSH 7.4",       status: "warning",    note: "CVE-2016-10009" },
    { version: "OpenSSH 6.6",       status: "vulnerable", note: "Multiple CVEs"  },
    { version: "Dropbear 2022.83",  status: "safe"       },
    { version: "Dropbear 2020.81",  status: "warning"    },
  ],
  Telnet: [
    { version: "BSD Telnetd",       status: "vulnerable", note: "Plaintext protocol" },
    { version: "Linux telnetd",     status: "vulnerable", note: "Plaintext protocol" },
  ],
  FTP: [
    { version: "vsftpd 3.0.5",         status: "safe"       },
    { version: "vsftpd 3.0.3",         status: "safe"       },
    { version: "vsftpd 2.3.4",         status: "vulnerable", note: "CVE-2011-2523 backdoor"  },
    { version: "ProFTPD 1.3.7",        status: "safe"       },
    { version: "ProFTPD 1.3.5",        status: "vulnerable", note: "CVE-2015-3306 mod_copy"  },
    { version: "FileZilla Server 1.6", status: "safe"       },
    { version: "Pure-FTPd 1.0.49",     status: "safe"       },
    { version: "wu-ftpd 2.6.2",        status: "vulnerable", note: "EOL, multiple CVEs"      },
  ],
  HTTP: [
    { version: "Apache 2.4.57",     status: "safe"       },
    { version: "Apache 2.4.51",     status: "vulnerable", note: "CVE-2021-41773 path traversal" },
    { version: "Apache 2.4.49",     status: "vulnerable", note: "CVE-2021-41773 path traversal" },
    { version: "Apache 2.2.34",     status: "vulnerable", note: "EOL, multiple CVEs"            },
    { version: "nginx 1.24.0",      status: "safe"       },
    { version: "nginx 1.18.0",      status: "warning"    },
    { version: "IIS 10.0",          status: "safe"       },
    { version: "IIS 8.5",           status: "warning"    },
    { version: "lighttpd 1.4.71",   status: "safe"       },
  ],
  HTTPS: [
    { version: "Apache 2.4.57 (TLS 1.3)", status: "safe"       },
    { version: "Apache 2.4.49 (TLS 1.2)", status: "vulnerable", note: "CVE-2021-41773" },
    { version: "nginx 1.24.0 (TLS 1.3)",  status: "safe"       },
    { version: "nginx 1.18.0 (TLS 1.2)",  status: "warning"    },
    { version: "IIS 10.0 (TLS 1.3)",      status: "safe"       },
  ],
  SMB: [
    { version: "Samba 4.17.0",   status: "safe"       },
    { version: "Samba 4.11.0",   status: "warning"    },
    { version: "Samba 3.5.0",    status: "vulnerable", note: "Multiple CVEs"          },
    { version: "Windows SMBv3",  status: "vulnerable", note: "CVE-2020-0796 SMBGhost" },
    { version: "Windows SMBv1",  status: "vulnerable", note: "MS17-010 EternalBlue"   },
  ],
  RDP: [
    { version: "RDP 10.0 (Windows 10/11)", status: "safe"       },
    { version: "RDP 8.1 (Windows 8.1)",    status: "warning"    },
    { version: "RDP 7.1 (Windows 7)",      status: "vulnerable", note: "CVE-2019-0708 BlueKeep"   },
    { version: "RDP 6.1 (Windows XP)",     status: "vulnerable", note: "Multiple critical CVEs"    },
  ],
  MySQL: [
    { version: "MySQL 8.0.33",   status: "safe"       },
    { version: "MySQL 8.0.20",   status: "warning"    },
    { version: "MySQL 5.7.42",   status: "safe"       },
    { version: "MySQL 5.7.21",   status: "warning"    },
    { version: "MySQL 5.6.51",   status: "vulnerable", note: "EOL" },
    { version: "MariaDB 10.11",  status: "safe"       },
    { version: "MariaDB 10.6",   status: "safe"       },
  ],
  PostgreSQL: [
    { version: "PostgreSQL 15.3",   status: "safe"       },
    { version: "PostgreSQL 14.8",   status: "safe"       },
    { version: "PostgreSQL 13.11",  status: "safe"       },
    { version: "PostgreSQL 12.15",  status: "warning"    },
    { version: "PostgreSQL 9.6.24", status: "vulnerable", note: "EOL" },
  ],
  MongoDB: [
    { version: "MongoDB 6.0.6",  status: "safe"       },
    { version: "MongoDB 5.0.18", status: "safe"       },
    { version: "MongoDB 4.4.22", status: "warning"    },
    { version: "MongoDB 3.6.23", status: "vulnerable", note: "EOL"                     },
    { version: "MongoDB 2.6.12", status: "vulnerable", note: "No auth by default, EOL" },
  ],
  Redis: [
    { version: "Redis 7.0.11", status: "safe"       },
    { version: "Redis 6.2.12", status: "safe"       },
    { version: "Redis 5.0.14", status: "warning"    },
    { version: "Redis 3.2.12", status: "vulnerable", note: "CVE-2022-0543" },
  ],
  DNS: [
    { version: "BIND 9.18.16",    status: "safe"    },
    { version: "BIND 9.16.42",    status: "safe"    },
    { version: "BIND 9.11.37",    status: "warning" },
    { version: "dnsmasq 2.89",    status: "safe"    },
    { version: "Unbound 1.17.1",  status: "safe"    },
    { version: "PowerDNS 4.7.3",  status: "safe"    },
  ],
  SMTP: [
    { version: "Postfix 3.7.4",     status: "safe"       },
    { version: "Sendmail 8.17.1",   status: "warning"    },
    { version: "Exim 4.96",         status: "safe"       },
    { version: "Exim 4.87",         status: "vulnerable", note: "CVE-2019-10149 RCE" },
    { version: "hMailServer 5.6.7", status: "warning"    },
  ],
  SNMP: [
    { version: "Net-SNMP 5.9.3 (v3)",   status: "safe"       },
    { version: "Net-SNMP 5.7.3 (v2c)",  status: "warning",    note: "Community string auth" },
    { version: "Net-SNMP 5.5 (v1)",     status: "vulnerable", note: "Plaintext, no auth"    },
  ],
  LDAP: [
    { version: "OpenLDAP 2.6.5",                        status: "safe"    },
    { version: "OpenLDAP 2.4.57",                       status: "safe"    },
    { version: "Active Directory (Windows Server 2022)", status: "safe"    },
    { version: "Active Directory (Windows Server 2016)", status: "warning" },
  ],
  NFS: [
    { version: "NFS 4.2",             status: "safe"       },
    { version: "NFS 4.1",             status: "safe"       },
    { version: "NFS v3 (no auth)",    status: "vulnerable", note: "No authentication" },
    { version: "NFS v2 (deprecated)", status: "vulnerable", note: "EOL, multiple CVEs" },
  ],
};

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

// ── Version Dropdown ─────────────────────────────────────────────
const STATUS_DOT   = { safe: "bg-green-400",   warning: "bg-yellow-400",   vulnerable: "bg-red-400"   };
const STATUS_TEXT  = { safe: "text-green-400",  warning: "text-yellow-400", vulnerable: "text-red-400" };
const STATUS_LABEL = { safe: "Safe",            warning: "Outdated",        vulnerable: "Vulnerable"   };

function VersionSelect({ serviceName, value, onChange }) {
  const [open, setOpen] = useState(false);
  const versions = SERVICE_VERSIONS[serviceName] || [];
  const selected = versions.find((v) => v.version === value);

  if (!serviceName || versions.length === 0) {
    return (
      <div className="w-full bg-gray-800 border border-gray-600 text-gray-500 text-xs rounded px-2 py-1.5">
        {serviceName ? "No versions available" : "Select a service first"}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-gray-800 border border-gray-600 text-white text-xs rounded px-2 py-1.5 flex items-center justify-between focus:outline-none focus:border-blue-500"
      >
        {selected ? (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[selected.status]}`} />
            <span className={STATUS_TEXT[selected.status]}>{selected.version}</span>
            <span className="text-gray-500">— {STATUS_LABEL[selected.status]}</span>
          </div>
        ) : (
          <span className="text-gray-500">Select version…</span>
        )}
        <span className="text-gray-400 ml-2">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="absolute z-50 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-52 overflow-y-auto shadow-2xl">
          {/* Legend */}
          <div className="flex gap-3 px-2 py-1.5 border-b border-gray-700">
            {Object.entries(STATUS_LABEL).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[k]}`} />
                <span className="text-gray-400 text-xs">{v}</span>
              </div>
            ))}
          </div>
          {versions.map((v) => (
            <div
              key={v.version}
              onClick={() => { onChange(v.version); setOpen(false); }}
              className="flex items-start gap-2 px-2 py-1.5 cursor-pointer hover:bg-gray-700 border-b border-gray-700/50"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${STATUS_DOT[v.status]}`} />
              <div>
                <span className={`text-xs ${STATUS_TEXT[v.status]}`}>{v.version}</span>
                {v.note && <p className="text-xs text-gray-500 mt-0.5">{v.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Service Editor (PC / Server) ─────────────────────────────────
function ServiceEditor({ services = [], onChange }) {
  const [open, setOpen]     = useState(false);
  const [mode, setMode]     = useState("preset");
  const [preset, setPreset] = useState("");
  const [form, setForm]     = useState({ port: "", name: "", protocol: "TCP", version: "", auth: "none" });

  const pickPreset = (e) => {
    const p = SERVICE_PRESETS.find((s) => s.name === e.target.value);
    setPreset(e.target.value);
    if (p) setForm({ port: p.port, name: p.name, protocol: p.protocol, version: "", auth: "none" });
  };

  const add = () => {
    if (!form.port || !form.name) return;
    onChange([...services, { ...form, port: Number(form.port), id: Date.now() }]);
    setForm({ port: "", name: "", protocol: "TCP", version: "", auth: "none" });
    setPreset("");
    setOpen(false);
  };

  const remove = (id) => onChange(services.filter((s) => s.id !== id));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className={lbl + " mb-0"}>Open Ports / Services</span>
        <button onClick={() => setOpen(!open)}
          className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-0.5 rounded text-white">
          {open ? "Cancel" : "+ Add"}
        </button>
      </div>

      {services.length === 0 && !open && (
        <p className="text-xs text-gray-500 italic">No services — host is dark.</p>
      )}

      {services.map((svc) => (
        <div key={svc.id} className="flex items-center justify-between bg-gray-800 rounded px-2 py-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-green-400 text-xs">{svc.port}/{svc.protocol}</span>
            <span className="text-white text-xs">{svc.name}</span>
            {svc.version && <span className="text-gray-500 text-xs">{svc.version}</span>}
            <span className={`text-xs font-mono ${svc.auth === "none" ? "text-red-400" : "text-yellow-300"}`}>
              [{svc.auth}]
            </span>
          </div>
          <button onClick={() => remove(svc.id)} className="text-red-500 hover:text-red-300 text-xs ml-2">✕</button>
        </div>
      ))}

      {open && (
        <div className="bg-gray-800 rounded p-2 space-y-2 border border-gray-600">
          <div className="flex gap-1">
            {["preset", "manual"].map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`text-xs px-2 py-0.5 rounded capitalize ${mode === m ? "bg-blue-700 text-white" : "bg-gray-700 text-gray-400"}`}>
                {m}
              </button>
            ))}
          </div>

          {mode === "preset" && (
            <select value={preset} onChange={pickPreset} className={inp}>
              <option value="">Select a known service…</option>
              {SERVICE_PRESETS.map((s) => (
                <option key={s.name} value={s.name}>{s.name} ({s.port}/{s.protocol})</option>
              ))}
            </select>
          )}

          <div className="flex gap-1">
            <input type="number" placeholder="Port" value={form.port}
              onChange={(e) => setForm({ ...form, port: e.target.value })}
              className="w-16 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
            <input type="text" placeholder="Service name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded px-2 py-1" />
            <select value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })}
              className="bg-gray-700 border border-gray-600 text-white text-xs rounded px-1">
              <option>TCP</option>
              <option>UDP</option>
            </select>
          </div>

          <VersionSelect
            serviceName={form.name}
            value={form.version}
            onChange={(v) => setForm({ ...form, version: v })}
          />

          <select value={form.auth} onChange={(e) => setForm({ ...form, auth: e.target.value })} className={inp}>
            <option value="none">Auth: None (open / anonymous)</option>
            <option value="password">Auth: Password</option>
            <option value="key">Auth: SSH Key / Certificate</option>
          </select>

          <button onClick={add}
            className="w-full bg-green-700 hover:bg-green-600 text-white text-xs rounded py-1">
            Add Service
          </button>
        </div>
      )}
    </div>
  );
}

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

// ── Main Component ───────────────────────────────────────────────
export default function PropertiesPanel({ node, onUpdate, onClose }) {
  if (!node) return null;

  const data = node.data;
  const dt   = data.deviceType;
  console.log("deviceType:",dt)
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
            <ServiceEditor services={data.services || []} onChange={(v) => set("services", v)} />
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
            <ServiceEditor services={data.services || []} onChange={(v) => set("services", v)} />
          </div>
        </>)}

        {/* ── ROUTER ── */}
        {dt.toLowerCase() === "router" && (<>
          <div><label className={lbl}>Hostname</label>
            <input className={inp} value={data.hostname || ""} onChange={(e) => set("hostname", e.target.value)} placeholder="core-router-1" /></div>
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