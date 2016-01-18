#!/usr/bin/env node

var app = require('express')();
var http = require('http').Server(app);
var os = require('os');
var crypto = require('crypto');
var path = require("path");

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

if (!((process.argv.length === 2 && process.argv[1]) || (process.argv.length === 3 && process.argv[2]))) {
	console.log('erreur');
	process.exit(1);
}

function randomValueBase64 (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')   // convert to base64 format
        .slice(0, len)        // return required number of characters
        .replace(/\+/g, '0')  // replace '+' with '0'
        .replace(/\//g, '0'); // replace '/' with '0'
}

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

var port = randomInt(20000, 65555);
var url = randomValueBase64(24);
var dir = path.resolve('./');

app.get('/' + url, function (req, res) {
	res.download(dir + '/' + process.argv[process.argv.length - 1], process.argv[process.argv.length - 1]);
});

http.listen(port, function () {
	for (var i = 0; i < addresses.length; i++) {
		console.log('http://' + addresses[i] + ':' + port + '/' + url);
	}
});
