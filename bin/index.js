#!/usr/bin/env node

var app = require('express')();
var http = require('http');
var https = require('https');
var os = require('os');
var crypto = require('crypto');
var path = require('path');
var getIP = require('external-ip')();
var pkg = require(path.join(__dirname, 'package.json'));
var program = require('commander');
var portfinder = require('portfinder');
var colors = require('colors');
var akeypair = require('akeypair');

var file;

program
	.version(pkg.version)
	.description(pkg.description)
	.arguments('<filename>')
	.action(function (filename) {
		file = filename;
	})
	.option('-p, --port <port>', 'port on which to listen to (defaults to 3000)', parseInt)
	.option('-u, --url <path>', 'specify url string (default is random)', '')
	.option('-e, --end <type>', 'set the end type, at the end of download (0) or date (1) (defaut end of download)', parseInt)
	.option('-s, --secure', 'use https protocol', true)
	.parse(process.argv);

if (typeof file === 'undefined') {
	program.outputHelp(colors.red);
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
var url = program.url || randomValueBase64(24);
var dir = path.resolve('./');
var randomPort = 8000;
var end = program.end || 0;

var start = function () {
	lock++;
	if (lock === LOCK_MAX) {
		var port = program.port || randomPort;
		if (program.secure) {
			akeypair({cert: true}, function (err, options) {
				if (err) {
					console.log(colors.red('can\'t create certificates...'));
					process.exit(1);
				}
				var httpsServer = https.createServer(options, app);
				httpsServer.listen(port, function () {
					for (var i = 0; i < addresses.length; i++) {
						console.log(colors.yellow('https://' + addresses[i] + ':' + port + '/' + url));
					}
				});
			});
		}
		else {
			var httpServer = http.createServer(app);
			httpServer.listen(port, function () {
				for (var i = 0; i < addresses.length; i++) {
					console.log(colors.yellow('http://' + addresses[i] + ':' + port + '/' + url));
				}
			});
		}
	}
};

portfinder.getPort(function (err, port) {
	if (err) {
		console.log(colors.red('failed to find an open port, please try again...'));
		process.exit(1);
	}
	randomPort = port;
	start();
});

getIP(function (err, ip) {
	if (err) {
		console.log(colors.red('can\'t check public ip address !'));
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
	res.download(dir + '/' + file, file, function (err) {
		if (err) {
			// Handle error, but keep in mind the response may be partially-sent
			// so check res.headersSent
			// TODO ?
		} else if (end === 0) {
			console.log(colors.green('download successful !'));
			process.exit(0);
		}
	});
});

start();
