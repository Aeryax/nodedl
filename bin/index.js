#!/usr/bin/env node

var app = require('express')();
var http = require('http').Server(app);
var os = require('os');
var crypto = require('crypto');
var path = require('path');
var getIP = require('external-ip')();
var pkg = require(__dirname, '/package.json');
var program = require('commander');
var portfinder = require('portfinder');

program
	.version(pkg.version)
	.description(pkg.description)
	.option('-p, --port <port>', 'Port on which to listen to (defaults to 3000)', parseInt)
	.option('-f, --file <filename>', 'Filename to stream', '')
	.option('-u, --url <path>', 'Specify url string (default is random)', '')
	.option('-e, --end <type>', 'Set the end type, at the end of download or date (defaut end of download)', parseInt)
	.parse(process.argv);

if (program.file === '') {
	console.log('use -f or --file <path> to specify input file');
	process.exit(1);
}

function randomValueBase64(len) {
	return crypto.randomBytes(Math.ceil(len * 3 / 4))
			.toString('base64')
			.slice(0, len)
			.replace(/\+/g, '0')
			.replace(/\//g, '0');
}

var addresses = [];
var lock = 0;
const LOCK_MAX = 3;
var url = randomValueBase64(24);
var dir = path.resolve('./');
var randomPort = 8000;

var start = function () {
	lock++;
	if (lock === LOCK_MAX) {
		var port = program.port || randomPort;
		http.listen(port, function () {
			for (var i = 0; i < addresses.length; i++) {
				console.log('http://' + addresses[i] + ':' + port + '/' + url);
			}
		});
	}
};

portfinder.getPort(function (err, port) {
	if (err) {
		console.log('failed to find an open port, please try again...');
		process.exit(1);
	}
	randomPort = port;
	start();
});

getIP(function (err, ip) {
	if (err) {
		console.log('Can\'t check public ip address !');
	}
	addresses.push(ip);
	start();
});

var interfaces = os.networkInterfaces();

for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2];
		if (address.family === 'IPv4' && !address.internal) {
			addresses.push(address.address);
		}
	}
}

app.get('/' + url, function (req, res) {
	res.download(dir + '/' + process.argv[process.argv.length - 1], process.argv[process.argv.length - 1]);
});

start();
