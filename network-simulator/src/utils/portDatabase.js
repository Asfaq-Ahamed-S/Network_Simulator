// ============================================================
//  NETWORKSIM — utils/portDatabase.js
//  Port → Service → Versions → CVE risk mapping
//  Used by Server node port editor in PropertiesPanel
// ============================================================

// Risk levels
export const RISK = {
  SAFE:     'safe',       // green  — no known critical CVEs, actively maintained
  MODERATE: 'moderate',   // yellow — known CVEs but patchable / older but not EOL
  HIGH:     'high',       // orange — actively exploited or EOL
  CRITICAL: 'critical',   // red    — backdoor / RCE / plaintext / wormable
};

export const RISK_STYLE = {
  safe:     { color: '#4ade80', label: 'Safe'     },
  moderate: { color: '#facc15', label: 'Moderate' },
  high:     { color: '#fb923c', label: 'High'     },
  critical: { color: '#f87171', label: 'Critical' },
};


// ── SERVICE VERSION DATABASE ──────────────────────────────────────────────────
//  Each entry: { version, risk, cves: [{ id, summary }] }
//  CVE summaries are intentionally brief — educational, not exhaustive.

export const SERVICE_VERSIONS = {

  SSH: [
    { version: 'OpenSSH 9.6p1',  risk: RISK.SAFE,     cves: [] },
    { version: 'OpenSSH 8.9p1',  risk: RISK.SAFE,     cves: [] },
    { version: 'OpenSSH 7.4',    risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2018-15473', summary: 'Username enumeration via timing side-channel' },
    ]},
    { version: 'OpenSSH 7.2p2',  risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2016-6210',  summary: 'User enumeration via timing in CBC mode' },
      { id: 'CVE-2016-0778',  summary: 'Buffer overflow in roaming feature' },
    ]},
    { version: 'OpenSSH 6.6p1',  risk: RISK.HIGH,      cves: [
      { id: 'CVE-2014-1692',  summary: 'Memory corruption with J-PAKE enabled' },
      { id: 'CVE-2015-5352',  summary: 'X11 forwarding connection bypass' },
    ]},
    { version: 'Dropbear 2022.83',risk: RISK.SAFE,     cves: [] },
    { version: 'Dropbear 2019.78',risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2018-15599', summary: 'Username enumeration via response timing' },
    ]},
  ],

  Telnet: [
    { version: 'telnetd (any)',   risk: RISK.CRITICAL,  cves: [
      { id: 'INHERENT',       summary: 'Plaintext protocol — credentials sent unencrypted over network' },
      { id: 'CVE-2011-4862',  summary: 'Remote code execution via encrypt_keyid()' },
    ]},
    { version: 'Microsoft Telnet Server', risk: RISK.CRITICAL, cves: [
      { id: 'INHERENT',       summary: 'Plaintext credentials, no encryption' },
    ]},
  ],

  FTP: [
    { version: 'vsftpd 3.0.5',   risk: RISK.SAFE,      cves: [] },
    { version: 'vsftpd 3.0.3',   risk: RISK.SAFE,      cves: [] },
    { version: 'vsftpd 2.3.4',   risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2011-2523',  summary: 'Backdoor shell triggered by :) in username — opens port 6200' },
    ]},
    { version: 'vsftpd 2.3.2',   risk: RISK.HIGH,      cves: [
      { id: 'CVE-2011-0762',  summary: 'DoS via STAT command with wildcard arguments' },
    ]},
    { version: 'ProFTPD 1.3.8',  risk: RISK.SAFE,      cves: [] },
    { version: 'ProFTPD 1.3.5',  risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2015-3306',  summary: 'mod_copy unauthenticated file copy → RCE' },
    ]},
    { version: 'ProFTPD 1.3.3c', risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2010-4221',  summary: 'Stack overflow in TELNET_IAC handling → RCE' },
    ]},
    { version: 'FileZilla Server 1.7.0', risk: RISK.SAFE, cves: [] },
    { version: 'Pure-FTPd 1.0.49', risk: RISK.SAFE,    cves: [] },
  ],

  'FTP-Data': [
    { version: 'Passive mode (PASV)', risk: RISK.SAFE,  cves: [] },
    { version: 'Active mode (PORT)',  risk: RISK.MODERATE, cves: [
      { id: 'DESIGN',         summary: 'Active mode allows server to initiate connections back through client firewall' },
    ]},
  ],

  HTTP: [
    { version: 'Apache 2.4.58',   risk: RISK.SAFE,      cves: [] },
    { version: 'Apache 2.4.54',   risk: RISK.SAFE,      cves: [] },
    { version: 'Apache 2.4.50',   risk: RISK.HIGH,      cves: [
      { id: 'CVE-2021-42013',  summary: 'Path traversal + RCE (bypass of 2.4.49 fix)' },
    ]},
    { version: 'Apache 2.4.49',   risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2021-41773',  summary: 'Path traversal allows reading files outside doc root; RCE if mod_cgi enabled' },
    ]},
    { version: 'Apache 2.2.34',   risk: RISK.CRITICAL,  cves: [
      { id: 'EOL',             summary: 'End-of-life — no security patches since 2017' },
      { id: 'CVE-2017-7679',   summary: 'mod_mime buffer overread' },
    ]},
    { version: 'nginx 1.25.3',    risk: RISK.SAFE,      cves: [] },
    { version: 'nginx 1.18.0',    risk: RISK.SAFE,      cves: [] },
    { version: 'nginx 1.14.0',    risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2019-20372',  summary: 'HTTP request smuggling via error_page redirect' },
    ]},
    { version: 'nginx 1.6.2',     risk: RISK.HIGH,      cves: [
      { id: 'CVE-2014-3556',   summary: 'STARTTLS plaintext injection' },
      { id: 'EOL',             summary: 'End-of-life — no security patches' },
    ]},
    { version: 'IIS 10.0',        risk: RISK.SAFE,      cves: [] },
    { version: 'IIS 8.5',         risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2017-7269',   summary: 'WebDAV buffer overflow → RCE (requires WebDAV enabled)' },
    ]},
    { version: 'IIS 6.0',         risk: RISK.CRITICAL,  cves: [
      { id: 'EOL',             summary: 'End-of-life — no patches since 2015' },
      { id: 'CVE-2017-7269',   summary: 'WebDAV ScStoragePathFromUrl buffer overflow → RCE' },
      { id: 'CVE-2010-2730',   summary: 'FastCGI extension buffer overflow → RCE' },
    ]},
    { version: 'Lighttpd 1.4.73', risk: RISK.SAFE,      cves: [] },
    { version: 'Lighttpd 1.4.35', risk: RISK.HIGH,      cves: [
      { id: 'CVE-2014-2323',   summary: 'SQL injection via host header in MySQL vhost module' },
    ]},
  ],

  HTTPS: [
    { version: 'Apache 2.4.58 + OpenSSL 3.x', risk: RISK.SAFE,     cves: [] },
    { version: 'Apache 2.4.58 + OpenSSL 1.1.1', risk: RISK.SAFE,   cves: [] },
    { version: 'nginx 1.25.3 + OpenSSL 3.x',   risk: RISK.SAFE,    cves: [] },
    { version: 'Apache + OpenSSL 1.0.1e',       risk: RISK.CRITICAL, cves: [
      { id: 'CVE-2014-0160',  summary: 'Heartbleed — read up to 64KB of server memory per request, leaks keys & creds' },
    ]},
    { version: 'Apache + SSLv3',                risk: RISK.CRITICAL, cves: [
      { id: 'CVE-2014-3566',  summary: 'POODLE — SSLv3 CBC padding oracle allows decryption of HTTPS traffic' },
    ]},
    { version: 'IIS 10.0 + TLS 1.3',           risk: RISK.SAFE,    cves: [] },
    { version: 'IIS 8.5 + TLS 1.0',            risk: RISK.HIGH,    cves: [
      { id: 'CVE-2011-3389',  summary: 'BEAST — TLS 1.0 CBC cipher attack allowing session cookie theft' },
    ]},
  ],

  SMTP: [
    { version: 'Postfix 3.8.0',   risk: RISK.SAFE,      cves: [] },
    { version: 'Postfix 3.4.0',   risk: RISK.SAFE,      cves: [] },
    { version: 'Sendmail 8.17.1', risk: RISK.SAFE,      cves: [] },
    { version: 'Sendmail 8.12.x', risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2003-0161',  summary: 'Prescan() heap overflow → remote root RCE' },
    ]},
    { version: 'Exim 4.97',       risk: RISK.SAFE,      cves: [] },
    { version: 'Exim 4.87',       risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2019-10149',  summary: 'SMTP command injection in MAIL FROM → remote root RCE without auth' },
    ]},
    { version: 'Haraka 2.8.28',   risk: RISK.SAFE,      cves: [] },
    { version: 'Haraka 2.8.8',    risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2016-9953',   summary: 'RCPT TO injection for path traversal → RCE via attachment plugin' },
    ]},
  ],

  DNS: [
    { version: 'BIND 9.18.x',     risk: RISK.SAFE,      cves: [] },
    { version: 'BIND 9.16.x',     risk: RISK.SAFE,      cves: [] },
    { version: 'BIND 9.11.x',     risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2020-8617',   summary: 'TSIG handling assertion failure → DoS crash' },
    ]},
    { version: 'BIND 9.9.x',      risk: RISK.HIGH,      cves: [
      { id: 'CVE-2015-5477',   summary: 'TKEY query processing → remote DoS via assertion failure' },
      { id: 'EOL',             summary: 'End-of-life branch' },
    ]},
    { version: 'Unbound 1.19.0',  risk: RISK.SAFE,      cves: [] },
    { version: 'dnsmasq 2.90',    risk: RISK.SAFE,      cves: [] },
    { version: 'dnsmasq 2.78',    risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2017-14491',  summary: 'DNSmasq heap overflow in DNS response processing → RCE' },
    ]},
  ],

  DHCP: [
    { version: 'ISC DHCP 4.4.3',  risk: RISK.SAFE,      cves: [] },
    { version: 'ISC DHCP 4.3.6',  risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2019-6470',   summary: 'DHCPv6 packet processing crash → DoS' },
    ]},
    { version: 'ISC DHCP 4.1.x',  risk: RISK.HIGH,      cves: [
      { id: 'CVE-2011-2748',   summary: 'Zero-length client ID → DHCP server crash (DoS)' },
      { id: 'EOL',             summary: 'End-of-life branch' },
    ]},
    { version: 'dnsmasq 2.90 (DHCP)', risk: RISK.SAFE,  cves: [] },
    { version: 'Windows DHCP Server 2019', risk: RISK.SAFE, cves: [] },
    { version: 'Windows DHCP Server 2008', risk: RISK.HIGH, cves: [
      { id: 'CVE-2019-0726',   summary: 'Heap corruption in DHCP server → RCE' },
      { id: 'EOL',             summary: 'Windows Server 2008 reached end-of-life January 2020' },
    ]},
  ],

  POP3: [
    { version: 'Dovecot 2.3.21',  risk: RISK.SAFE,      cves: [] },
    { version: 'Dovecot 2.2.36',  risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2019-11494',  summary: 'TLS SNI handling null deref → DoS' },
    ]},
    { version: 'Cyrus IMAP 3.8.0', risk: RISK.SAFE,     cves: [] },
    { version: 'UW-IMAP 2007f',   risk: RISK.HIGH,      cves: [
      { id: 'CVE-2008-5514',   summary: 'Off-by-one overflow in IMAP literal handling → DoS/possible RCE' },
    ]},
  ],

  IMAP: [
    { version: 'Dovecot 2.3.21',  risk: RISK.SAFE,      cves: [] },
    { version: 'Dovecot 2.2.36',  risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2019-11500',  summary: 'Pre-auth heap buffer overflow via IMAP/ManageSieve protocol' },
    ]},
    { version: 'Cyrus IMAP 3.8.0', risk: RISK.SAFE,     cves: [] },
    { version: 'UW-IMAP 2007f',   risk: RISK.HIGH,      cves: [
      { id: 'CVE-2005-2933',   summary: 'Buffer overflow in imap/mail.c via malformed mailbox name' },
    ]},
  ],

  SMB: [
    { version: 'Samba 4.19.0',    risk: RISK.SAFE,      cves: [] },
    { version: 'Samba 4.11.0',    risk: RISK.SAFE,      cves: [] },
    { version: 'Samba 3.5.0',     risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2017-7494',   summary: 'SambaCry — arbitrary shared library load → unauthenticated RCE' },
    ]},
    { version: 'Samba 3.0.20',    risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2007-2447',   summary: 'Username map script injection → command execution without auth' },
    ]},
    { version: 'Windows SMBv1',   risk: RISK.CRITICAL,  cves: [
      { id: 'MS17-010',        summary: 'EternalBlue — wormable unauthenticated RCE; used by WannaCry & NotPetya' },
    ]},
    { version: 'Windows SMBv2/v3 (patched)', risk: RISK.SAFE, cves: [] },
    { version: 'Windows SMBv3 (unpatched)', risk: RISK.CRITICAL, cves: [
      { id: 'CVE-2020-0796',   summary: 'SMBGhost — SMB3 compression integer overflow → unauthenticated RCE' },
    ]},
  ],

  MySQL: [
    { version: 'MySQL 8.0.35',    risk: RISK.SAFE,      cves: [] },
    { version: 'MySQL 5.7.44',    risk: RISK.SAFE,      cves: [] },
    { version: 'MySQL 5.6.17',    risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2014-0001',   summary: 'Client buffer overflow allows server to exploit connecting clients' },
    ]},
    { version: 'MySQL 5.1.x',     risk: RISK.HIGH,      cves: [
      { id: 'EOL',             summary: 'End-of-life — no security patches since 2013' },
      { id: 'CVE-2012-5615',   summary: 'Username enumeration via timing difference in auth failure response' },
    ]},
    { version: 'MariaDB 11.2.0',  risk: RISK.SAFE,      cves: [] },
    { version: 'MariaDB 10.3.x',  risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2021-27928',  summary: 'OS command injection via wsrep_provider path → RCE for DB admin' },
    ]},
  ],

  PostgreSQL: [
    { version: 'PostgreSQL 16.1', risk: RISK.SAFE,      cves: [] },
    { version: 'PostgreSQL 14.0', risk: RISK.SAFE,      cves: [] },
    { version: 'PostgreSQL 9.3',  risk: RISK.HIGH,      cves: [
      { id: 'EOL',             summary: 'End-of-life — no patches since November 2018' },
      { id: 'CVE-2019-10164',  summary: 'Stack overflow in parsing of security definer functions' },
    ]},
  ],

  RDP: [
    { version: 'RDP (Windows Server 2022)', risk: RISK.SAFE,     cves: [] },
    { version: 'RDP (Windows 10/11)',       risk: RISK.SAFE,     cves: [] },
    { version: 'RDP (Windows 7 — unpatched)', risk: RISK.CRITICAL, cves: [
      { id: 'CVE-2019-0708',  summary: 'BlueKeep — pre-auth wormable RCE via RDP, no credentials required' },
    ]},
    { version: 'RDP (Windows 8 — unpatched)', risk: RISK.CRITICAL, cves: [
      { id: 'CVE-2019-1181',  summary: 'DejaBlue — pre-auth RCE via RDP on Windows 8/8.1/Server 2012' },
    ]},
    { version: 'RDP (CredSSP — unpatched)', risk: RISK.HIGH,     cves: [
      { id: 'CVE-2018-0886',  summary: 'CredSSP oracle attack allows MITM to relay credentials → RCE' },
    ]},
  ],

  VNC: [
    { version: 'TigerVNC 1.13.1', risk: RISK.SAFE,      cves: [] },
    { version: 'RealVNC 7.6',     risk: RISK.SAFE,      cves: [] },
    { version: 'LibVNCServer 0.9.13', risk: RISK.MODERATE, cves: [
      { id: 'CVE-2019-15681',  summary: 'Server-side memory leak of framebuffer data to connected clients' },
    ]},
    { version: 'UltraVNC 1.0.x',  risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2008-3493',   summary: 'Stack overflow via malformed client message → RCE' },
    ]},
    { version: 'VNC (no auth)',    risk: RISK.CRITICAL,  cves: [
      { id: 'MISCONFIG',       summary: 'Authentication disabled — full desktop access to any network client' },
    ]},
  ],

  SNMP: [
    { version: 'Net-SNMP 5.9.4 (SNMPv3)', risk: RISK.SAFE,    cves: [] },
    { version: 'Net-SNMP 5.7.x (SNMPv2c)', risk: RISK.HIGH,   cves: [
      { id: 'DESIGN',          summary: 'SNMPv2c uses community strings (plaintext passwords) — easily sniffed' },
      { id: 'CVE-2018-18065',  summary: 'Malformed OID causes NULL deref → DoS' },
    ]},
    { version: 'SNMPv1 (community: public)', risk: RISK.CRITICAL, cves: [
      { id: 'DESIGN',          summary: 'SNMPv1 has no encryption or authentication — default community \'public\' widely known' },
    ]},
  ],

  LDAP: [
    { version: 'OpenLDAP 2.6.7',  risk: RISK.SAFE,      cves: [] },
    { version: 'OpenLDAP 2.4.57', risk: RISK.SAFE,      cves: [] },
    { version: 'OpenLDAP 2.4.44', risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2017-9287',   summary: 'modrdn operation double-free → DoS crash' },
    ]},
    { version: 'LDAP (no TLS)',   risk: RISK.HIGH,       cves: [
      { id: 'DESIGN',          summary: 'Credentials and directory queries transmitted in plaintext' },
    ]},
  ],

  Redis: [
    { version: 'Redis 7.2.3',     risk: RISK.SAFE,      cves: [] },
    { version: 'Redis 6.2.x',     risk: RISK.SAFE,      cves: [] },
    { version: 'Redis (no auth)', risk: RISK.CRITICAL,  cves: [
      { id: 'MISCONFIG',       summary: 'Redis with no AUTH and public bind — allows arbitrary key reads, config changes, and SLAVEOF RCE' },
    ]},
    { version: 'Redis 2.x (no auth)', risk: RISK.CRITICAL, cves: [
      { id: 'MISCONFIG',       summary: 'CONFIG SET dir + dbfilename to write SSH keys or cron jobs → RCE' },
    ]},
  ],

  MongoDB: [
    { version: 'MongoDB 7.0',     risk: RISK.SAFE,      cves: [] },
    { version: 'MongoDB 4.4',     risk: RISK.SAFE,      cves: [] },
    { version: 'MongoDB (no auth)', risk: RISK.CRITICAL, cves: [
      { id: 'MISCONFIG',       summary: 'MongoDB with no auth exposed publicly — full DB read/write/drop to anyone' },
    ]},
    { version: 'MongoDB 2.6',     risk: RISK.HIGH,      cves: [
      { id: 'EOL',             summary: 'End-of-life — no security patches since October 2016' },
    ]},
  ],

  Elasticsearch: [
    { version: 'Elasticsearch 8.11.0', risk: RISK.SAFE,  cves: [] },
    { version: 'Elasticsearch 7.x (with security)', risk: RISK.SAFE, cves: [] },
    { version: 'Elasticsearch 6.x (no auth)', risk: RISK.CRITICAL, cves: [
      { id: 'MISCONFIG',       summary: 'No auth by default in 6.x — unauthenticated read/write of all indices' },
    ]},
    { version: 'Elasticsearch 1.6.0', risk: RISK.CRITICAL, cves: [
      { id: 'CVE-2015-1427',   summary: 'Groovy sandbox escape → arbitrary OS command execution' },
    ]},
  ],

  NFS: [
    { version: 'NFSv4 (Kerberos auth)', risk: RISK.SAFE,   cves: [] },
    { version: 'NFSv3 (IP-based auth)', risk: RISK.HIGH,   cves: [
      { id: 'DESIGN',          summary: 'NFS trusts source IP — UID spoofing grants unauthorized file access' },
    ]},
    { version: 'NFS (world-readable export)', risk: RISK.CRITICAL, cves: [
      { id: 'MISCONFIG',       summary: 'exports file with *(rw,no_root_squash) — any host mounts and writes as root' },
    ]},
  ],

  BGP: [
    { version: 'FRRouting 9.0',   risk: RISK.SAFE,      cves: [] },
    { version: 'Quagga 1.2.4',    risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2018-5379',   summary: 'Double-free in BGP OPEN message handling → DoS / possible RCE' },
    ]},
    { version: 'BGP (no MD5 auth)', risk: RISK.HIGH,    cves: [
      { id: 'CVE-2004-0230',   summary: 'TCP RST injection against blind BGP sessions — allows route table poisoning' },
    ]},
  ],

  NTP: [
    { version: 'ntpd 4.2.8p17',   risk: RISK.SAFE,      cves: [] },
    { version: 'ntpd 4.2.8p10',   risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2016-7434',   summary: 'NULL pointer deref in mrulist handling → DoS' },
    ]},
    { version: 'ntpd 4.2.7p26',   risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2013-5211',   summary: 'monlist command abused for 550x amplification DDoS reflection' },
    ]},
  ],

  TFTP: [
    { version: 'tftpd-hpa 5.2',   risk: RISK.MODERATE,  cves: [
      { id: 'DESIGN',          summary: 'TFTP has no authentication — any client can read/write if server is world-accessible' },
    ]},
  ],

  Syslog: [
    { version: 'rsyslog 8.2310.0', risk: RISK.SAFE,     cves: [] },
    { version: 'syslog-ng 4.4.0',  risk: RISK.SAFE,     cves: [] },
    { version: 'Syslog (UDP, no TLS)', risk: RISK.MODERATE, cves: [
      { id: 'DESIGN',          summary: 'UDP syslog is spoofable and unencrypted — log injection and log loss risk' },
    ]},
  ],

  NetBIOS: [
    { version: 'Windows NetBIOS (modern)', risk: RISK.HIGH, cves: [
      { id: 'DESIGN',          summary: 'NetBIOS exposes hostnames, workgroup, and logged-on users via null sessions' },
      { id: 'CVE-1999-0519',   summary: 'Windows NetBIOS null session — allows enumeration of shares without auth' },
    ]},
  ],

  RPC: [
    { version: 'rpcbind 0.2.5',   risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2017-8779',   summary: 'Memory exhaustion via crafted UDP packets → DoS' },
    ]},
    { version: 'Microsoft RPC (patched)', risk: RISK.SAFE, cves: [] },
    { version: 'Microsoft RPC (MS03-026)', risk: RISK.CRITICAL, cves: [
      { id: 'MS03-026',        summary: 'Buffer overflow in DCOM RPC interface → unauthenticated RCE; used by Blaster worm' },
    ]},
  ],

  OpenVPN: [
    { version: 'OpenVPN 2.6.8',   risk: RISK.SAFE,      cves: [] },
    { version: 'OpenVPN 2.4.x',   risk: RISK.SAFE,      cves: [] },
    { version: 'OpenVPN 2.3.x',   risk: RISK.MODERATE,  cves: [
      { id: 'CVE-2017-7508',   summary: 'IPv6 route handling crash → DoS on authenticated clients' },
    ]},
  ],

  MSSQL: [
    { version: 'SQL Server 2022',  risk: RISK.SAFE,      cves: [] },
    { version: 'SQL Server 2019',  risk: RISK.SAFE,      cves: [] },
    { version: 'SQL Server 2008',  risk: RISK.HIGH,      cves: [
      { id: 'EOL',             summary: 'End-of-life — no patches since July 2019' },
    ]},
    { version: 'SQL Server 2000',  risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2002-0649',   summary: 'Buffer overflow in SQL Server Resolution Service → RCE without auth; used by Slammer worm' },
    ]},
  ],

  Oracle: [
    { version: 'Oracle DB 21c',    risk: RISK.SAFE,      cves: [] },
    { version: 'Oracle DB 19c',    risk: RISK.SAFE,      cves: [] },
    { version: 'Oracle DB 11g',    risk: RISK.HIGH,      cves: [
      { id: 'EOL',             summary: 'End-of-life since December 2020' },
      { id: 'CVE-2012-1675',   summary: 'TNS Poison — MitM attack against TNS listener allows session hijack' },
    ]},
  ],

  Kubernetes: [
    { version: 'Kubernetes 1.28+', risk: RISK.SAFE,      cves: [] },
    { version: 'Kubernetes 1.18',  risk: RISK.HIGH,      cves: [
      { id: 'CVE-2020-8558',   summary: 'Route misconfiguration allows access to localhost services on other nodes' },
    ]},
    { version: 'Kubernetes (API unauthenticated)', risk: RISK.CRITICAL, cves: [
      { id: 'MISCONFIG',       summary: 'Exposed kube-apiserver with anonymous access — cluster takeover via kubectl' },
    ]},
  ],

  Jupyter: [
    { version: 'JupyterLab 4.0',  risk: RISK.SAFE,      cves: [] },
    { version: 'Jupyter (no token/password)', risk: RISK.CRITICAL, cves: [
      { id: 'MISCONFIG',       summary: 'Jupyter with no auth → arbitrary Python execution as server user' },
    ]},
  ],

  Grafana: [
    { version: 'Grafana 10.2.0',  risk: RISK.SAFE,      cves: [] },
    { version: 'Grafana 8.x',     risk: RISK.CRITICAL,  cves: [
      { id: 'CVE-2021-43798',  summary: 'Directory traversal via plugin path → read any file on server, including /etc/passwd and grafana.db' },
    ]},
  ],

  cPanel: [
    { version: 'cPanel 114.x',    risk: RISK.SAFE,      cves: [] },
    { version: 'cPanel 76.x',     risk: RISK.HIGH,      cves: [
      { id: 'CVE-2019-14271',  summary: 'Docker cp path traversal — container escape to host root' },
    ]},
  ],

  SOCKS: [
    { version: 'Dante 1.4.3 (SOCKS5)', risk: RISK.SAFE, cves: [] },
    { version: 'SOCKS4 (open proxy)',  risk: RISK.HIGH,  cves: [
      { id: 'DESIGN',          summary: 'SOCKS4 has no authentication — open proxy allowing traffic relay and IP spoofing' },
    ]},
  ],

  Metasploit: [
    { version: 'Metasploit listener', risk: RISK.CRITICAL, cves: [
      { id: 'INTENTIONAL',     summary: 'Meterpreter/shell handler — attacker C2 port. Presence indicates active compromise or authorized pentest.' },
    ]},
  ],
};


// ── PORT → SERVICE MAP ────────────────────────────────────────────────────────
//  Standard IANA port assignments + common de-facto assignments.
//  Format: port (number) → { service, protocol, description }

export const PORT_MAP = [
  // ─ 0–1023 Well-Known Ports ─────────────────────────────────────────────────
  { port: 20,    protocol: 'TCP',     service: 'FTP-Data',     description: 'FTP Data Transfer' },
  { port: 21,    protocol: 'TCP',     service: 'FTP',          description: 'File Transfer Protocol' },
  { port: 22,    protocol: 'TCP',     service: 'SSH',          description: 'Secure Shell' },
  { port: 23,    protocol: 'TCP',     service: 'Telnet',       description: 'Telnet (Plaintext — avoid)' },
  { port: 25,    protocol: 'TCP',     service: 'SMTP',         description: 'Simple Mail Transfer Protocol' },
  { port: 53,    protocol: 'TCP/UDP', service: 'DNS',          description: 'Domain Name System' },
  { port: 67,    protocol: 'UDP',     service: 'DHCP',         description: 'DHCP Server' },
  { port: 68,    protocol: 'UDP',     service: 'DHCP',         description: 'DHCP Client' },
  { port: 69,    protocol: 'UDP',     service: 'TFTP',         description: 'Trivial File Transfer Protocol' },
  { port: 80,    protocol: 'TCP',     service: 'HTTP',         description: 'Hypertext Transfer Protocol' },
  { port: 110,   protocol: 'TCP',     service: 'POP3',         description: 'Post Office Protocol v3' },
  { port: 119,   protocol: 'TCP',     service: 'NNTP',         description: 'Network News Transfer Protocol' },
  { port: 123,   protocol: 'UDP',     service: 'NTP',          description: 'Network Time Protocol' },
  { port: 135,   protocol: 'TCP',     service: 'RPC',          description: 'Microsoft RPC / DCOM' },
  { port: 137,   protocol: 'UDP',     service: 'NetBIOS',      description: 'NetBIOS Name Service' },
  { port: 138,   protocol: 'UDP',     service: 'NetBIOS',      description: 'NetBIOS Datagram Service' },
  { port: 139,   protocol: 'TCP',     service: 'NetBIOS',      description: 'NetBIOS Session Service' },
  { port: 143,   protocol: 'TCP',     service: 'IMAP',         description: 'Internet Message Access Protocol' },
  { port: 161,   protocol: 'UDP',     service: 'SNMP',         description: 'Simple Network Management Protocol' },
  { port: 162,   protocol: 'UDP',     service: 'SNMP',         description: 'SNMP Trap' },
  { port: 179,   protocol: 'TCP',     service: 'BGP',          description: 'Border Gateway Protocol' },
  { port: 194,   protocol: 'TCP',     service: 'IRC',          description: 'Internet Relay Chat' },
  { port: 389,   protocol: 'TCP',     service: 'LDAP',         description: 'Lightweight Directory Access Protocol' },
  { port: 443,   protocol: 'TCP',     service: 'HTTPS',        description: 'HTTP over TLS' },
  { port: 445,   protocol: 'TCP',     service: 'SMB',          description: 'Server Message Block / CIFS' },
  { port: 465,   protocol: 'TCP',     service: 'SMTP',         description: 'SMTP over TLS (SMTPS)' },
  { port: 500,   protocol: 'UDP',     service: 'IKE',          description: 'IPsec IKE' },
  { port: 514,   protocol: 'UDP',     service: 'Syslog',       description: 'Syslog' },
  { port: 587,   protocol: 'TCP',     service: 'SMTP',         description: 'SMTP Submission (STARTTLS)' },
  { port: 631,   protocol: 'TCP',     service: 'IPP',          description: 'Internet Printing Protocol (CUPS)' },
  { port: 636,   protocol: 'TCP',     service: 'LDAP',         description: 'LDAP over TLS (LDAPS)' },
  { port: 873,   protocol: 'TCP',     service: 'rsync',        description: 'rsync file sync' },
  { port: 993,   protocol: 'TCP',     service: 'IMAP',         description: 'IMAP over TLS (IMAPS)' },
  { port: 995,   protocol: 'TCP',     service: 'POP3',         description: 'POP3 over TLS (POP3S)' },

  // ─ 1024–49151 Registered Ports ─────────────────────────────────────────────
  { port: 1080,  protocol: 'TCP',     service: 'SOCKS',        description: 'SOCKS Proxy' },
  { port: 1194,  protocol: 'UDP',     service: 'OpenVPN',      description: 'OpenVPN' },
  { port: 1433,  protocol: 'TCP',     service: 'MSSQL',        description: 'Microsoft SQL Server' },
  { port: 1521,  protocol: 'TCP',     service: 'Oracle',       description: 'Oracle Database TNS Listener' },
  { port: 1723,  protocol: 'TCP',     service: 'PPTP',         description: 'Point-to-Point Tunneling Protocol' },
  { port: 2049,  protocol: 'TCP',     service: 'NFS',          description: 'Network File System' },
  { port: 2082,  protocol: 'TCP',     service: 'cPanel',       description: 'cPanel Web Panel (HTTP)' },
  { port: 2083,  protocol: 'TCP',     service: 'cPanel',       description: 'cPanel Web Panel (HTTPS)' },
  { port: 2222,  protocol: 'TCP',     service: 'SSH',          description: 'SSH (alternate port)' },
  { port: 3000,  protocol: 'TCP',     service: 'Grafana',      description: 'Grafana / Node.js apps' },
  { port: 3306,  protocol: 'TCP',     service: 'MySQL',        description: 'MySQL / MariaDB' },
  { port: 3389,  protocol: 'TCP',     service: 'RDP',          description: 'Remote Desktop Protocol' },
  { port: 4444,  protocol: 'TCP',     service: 'Metasploit',   description: 'Metasploit default listener / Meterpreter' },
  { port: 5432,  protocol: 'TCP',     service: 'PostgreSQL',   description: 'PostgreSQL Database' },
  { port: 5900,  protocol: 'TCP',     service: 'VNC',          description: 'Virtual Network Computing' },
  { port: 6379,  protocol: 'TCP',     service: 'Redis',        description: 'Redis In-Memory Database' },
  { port: 6443,  protocol: 'TCP',     service: 'Kubernetes',   description: 'Kubernetes API Server' },
  { port: 8080,  protocol: 'TCP',     service: 'HTTP',         description: 'HTTP Alternate / Proxy' },
  { port: 8443,  protocol: 'TCP',     service: 'HTTPS',        description: 'HTTPS Alternate' },
  { port: 8888,  protocol: 'TCP',     service: 'Jupyter',      description: 'Jupyter Notebook Server' },
  { port: 9200,  protocol: 'TCP',     service: 'Elasticsearch', description: 'Elasticsearch REST API' },
  { port: 27017, protocol: 'TCP',     service: 'MongoDB',      description: 'MongoDB Database' },
];


// ── LOOKUP HELPERS ────────────────────────────────────────────────────────────

/** Get port entry by port number */
export function getPortInfo(portNumber) {
  return PORT_MAP.find(p => p.port === portNumber) ?? null;
}

/** Get all available versions for a service */
export function getVersionsForService(serviceName) {
  return SERVICE_VERSIONS[serviceName] ?? [];
}

/** Default (first / safest) version for a service */
export function getDefaultVersion(serviceName) {
  const versions = getVersionsForService(serviceName);
  return versions[0] ?? null;
}

/** Get all CVEs for a specific version string */
export function getCVEsForVersion(serviceName, versionString) {
  const versions = getVersionsForService(serviceName);
  return versions.find(v => v.version === versionString)?.cves ?? [];
}

/** Risk level for a version */
export function getRiskForVersion(serviceName, versionString) {
  const versions = getVersionsForService(serviceName);
  return versions.find(v => v.version === versionString)?.risk ?? RISK.SAFE;
}

/** Create a fresh port entry for a node */
export function createPortEntry(portNumber) {
  const info = getPortInfo(portNumber);
  if (!info) return null;
  const defaultVer = getDefaultVersion(info.service);
  return {
    port:     portNumber,
    protocol: info.protocol,
    service:  info.service,
    version:  defaultVer?.version ?? 'Unknown',
    risk:     defaultVer?.risk ?? RISK.SAFE,
    state:    'open',   // 'open' | 'closed' | 'filtered'
  };
}

/** Overall risk of a node's port list (highest risk wins) */
const RISK_ORDER = [RISK.SAFE, RISK.MODERATE, RISK.HIGH, RISK.CRITICAL];
export function getNodeRisk(ports = []) {
  if (ports.length === 0) return RISK.SAFE;
  return ports.reduce((worst, p) => {
    return RISK_ORDER.indexOf(p.risk) > RISK_ORDER.indexOf(worst) ? p.risk : worst;
  }, RISK.SAFE);
}
