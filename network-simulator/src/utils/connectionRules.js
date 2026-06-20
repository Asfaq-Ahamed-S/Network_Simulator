const key = (a, b) => [a, b].sort().join(':');

const RULES = {

  //PC
  [key('pc','pc')]:       { status:'block', message:'PCs cannot connect directly. Use a Switch or Hub between them.' },
  [key('pc','server')]:   { status:'warn',  message:'Direct PC–Server link is unusual. In production, place a Switch between them.' },
  [key('pc','router')]:   { status:'allow' },
  [key('pc','switch')]:   { status:'allow' },
  [key('pc','hub')]:      { status:'allow' },
  [key('pc','firewall')]: { status:'warn',  message:'Direct PC–Firewall is uncommon. Typically a Switch sits between end devices and the Firewall.' },
  [key('pc','ids')]:      { status:'block', message:'PCs do not connect directly to IDS/IPS appliances.' },
  [key('pc','waf')]:      { status:'block', message:'PCs do not connect directly to WAF appliances.' },
  [key('pc','ap')]:       { status:'allow' },
  [key('pc','cloud')]:    { status:'block', message:'PCs cannot connect directly to Cloud. Route through a Router or Firewall.' },
  [key('pc','vpn')]:      { status:'block', message:'PCs do not connect directly to VPN Gateways.' },

  //Server
  [key('server','server')]:   { status:'warn',  message:'Direct Server–Server link (clustering / heartbeat). Valid for HA setups.' },
  [key('server','router')]:   { status:'allow' },
  [key('server','switch')]:   { status:'allow' },
  [key('server','hub')]:      { status:'allow' },
  [key('server','firewall')]: { status:'allow' },
  [key('server','ids')]:      { status:'allow' },
  [key('server','waf')]:      { status:'allow' },
  [key('server','ap')]:       { status:'block', message:'Servers do not connect to Access Points.' },
  [key('server','cloud')]:    { status:'warn',  message:'Direct Server–Cloud link. In secure networks a Firewall or VPN sits between them.' },
  [key('server','vpn')]:      { status:'warn',  message:'Direct Server–VPN Gateway is unusual. Route through a Switch or Firewall.' },

  //Router
  [key('router','router')]:   { status:'allow' },
  [key('router','switch')]:   { status:'allow' },
  [key('router','hub')]:      { status:'warn',  message:'Hub is deprecated. Consider replacing with a Switch.' },
  [key('router','firewall')]: { status:'allow' },
  [key('router','ids')]:      { status:'allow' },
  [key('router','waf')]:      { status:'warn',  message:'WAF typically sits between a Switch and Server, not directly on a Router interface.' },
  [key('router','ap')]:       { status:'allow' },
  [key('router','cloud')]:    { status:'allow' },
  [key('router','vpn')]:      { status:'allow' },

  //Switch
  [key('switch','switch')]:   { status:'allow' },
  [key('switch','hub')]:      { status:'allow' },
  [key('switch','firewall')]: { status:'allow' },
  [key('switch','ids')]:      { status:'allow' },
  [key('switch','waf')]:      { status:'allow' },
  [key('switch','ap')]:       { status:'allow' },
  [key('switch','cloud')]:    { status:'block', message:'Switches cannot connect directly to Cloud. Use a Router or Firewall as the gateway.' },
  [key('switch','vpn')]:      { status:'allow' },

  //Hub
  [key('hub','hub')]:      { status:'warn',  message:'Daisy-chaining Hubs creates collision domains. Replace with Switches.' },
  [key('hub','firewall')]: { status:'block', message:'Hubs must not sit directly in front of a Firewall. Use a Switch.' },
  [key('hub','ids')]:      { status:'block', message:'Hubs cannot connect to IDS/IPS appliances.' },
  [key('hub','waf')]:      { status:'block', message:'Hubs cannot connect to WAF appliances.' },
  [key('hub','ap')]:       { status:'block', message:'Hubs cannot connect to Access Points.' },
  [key('hub','cloud')]:    { status:'block', message:'Hubs cannot connect to Cloud. Use a Router.' },
  [key('hub','vpn')]:      { status:'block', message:'Hubs cannot connect to VPN Gateways.' },

  //Firewall
  [key('firewall','firewall')]: { status:'warn',  message:'Firewall–Firewall link (Active/Passive HA pair). Valid for high-availability setups.' },
  [key('firewall','ids')]:      { status:'allow' },
  [key('firewall','waf')]:      { status:'allow' },
  [key('firewall','ap')]:       { status:'warn',  message:'Firewall–AP direct link is uncommon. Typically a Switch sits between them.' },
  [key('firewall','cloud')]:    { status:'allow' },
  [key('firewall','vpn')]:      { status:'allow' },

  //IDS/IPS
  [key('ids','ids')]:   { status:'block', message:'Two IDS/IPS appliances cannot connect directly to each other.' },
  [key('ids','waf')]:   { status:'block', message:'IDS/IPS and WAF do not connect directly. Both attach to a Switch or Firewall.' },
  [key('ids','ap')]:    { status:'block', message:'IDS/IPS does not connect to Access Points.' },
  [key('ids','cloud')]: { status:'block', message:'IDS/IPS does not connect directly to Cloud.' },
  [key('ids','vpn')]:   { status:'block', message:'IDS/IPS does not connect directly to VPN Gateways.' },

  //WAF
  [key('waf','waf')]:   { status:'block', message:'Two WAF appliances cannot connect directly to each other.' },
  [key('waf','ap')]:    { status:'block', message:'WAF does not connect to Access Points.' },
  [key('waf','cloud')]: { status:'allow' },
  [key('waf','vpn')]:   { status:'warn',  message:'WAF–VPN direct link is unusual. A Switch or Firewall typically sits between them.' },

  //Access Point
  [key('ap','ap')]:    { status:'warn',  message:'AP–AP link (Wireless Mesh / WDS). Valid for mesh network topologies.' },
  [key('ap','cloud')]: { status:'block', message:'Access Points do not connect directly to Cloud.' },
  [key('ap','vpn')]:   { status:'block', message:'Access Points do not connect directly to VPN Gateways.' },

  //Cloud
  [key('cloud','cloud')]: { status:'block', message:'Two Cloud nodes cannot connect directly in a network topology.' },
  [key('cloud','vpn')]:   { status:'allow' },

  //VPN Gateway
  [key('vpn','vpn')]: { status:'block', message:'Two VPN Gateways cannot connect directly. Place a Router or Firewall between them.' },
};

export function checkConnection(typeA, typeB) {
  const rule = RULES[key(typeA?.toLowerCase(), typeB?.toLowerCase())];
  return rule ?? { status: 'allow' };
}