const os = require('os');
os.networkInterfaces = () => ({
  lo: [{
    address: '127.0.0.1',
    netmask: '255.0.0.0',
    family: 'IPv4',
    mac: '00:00:00:00:00:00',
    internal: true,
    cidr: '127.0.0.1/8'
  }],
  eth0: [{
    address: '10.0.0.2',
    netmask: '255.255.255.0',
    family: 'IPv4',
    mac: '00:00:00:00:00:01',
    internal: false,
    cidr: '10.0.0.2/24'
  }]
});
console.log('[preload] network mocked with netmask');
