#!/usr/bin/env node

var path = require('path');
var config = require('./config.json');
var WebSocket = require('ws');

var profile = require('./profile/' + config.profile + '.json').map(function(filename) {
    return require('./subscription/' + filename);
});

/**
 * Subscribe to multiple data sources
 *
 * @param subs Array of subscriptions
 * @param cb Callback that is executed whenever the data is obtained
 * @param repeat How often to poll the subscriptions (optional)
 */
function subscribe(subs, cb, repeat, lastTime) {
    var allComponents = [];

    var done = function() {
        cb(false, allComponents);
        if (!repeat) return;

        var now = new Date();
        var timeout = repeat;
        if (lastTime) timeout -= now - lastTime;

        setTimeout(subscribe.bind(null, subs, cb, repeat, now), timeout);
    }

    var count = subs.length;
    subs.forEach(function(sub) {
        sub(function(err, components) {
            if (!err) allComponents = allComponents.concat(components);
            if (--count === 0) done();
        });
    });
}

var request = require('request');
var url = 'http://' + config.server + ':' + config.port + '/generate';
request(url, function (err, response, body) {
    if (err) return console.error(err);
    if (response.statusCode != 200) {
        return console.error('HTTP', response.statusCode);
    }

    var token = JSON.parse(body).token;
    var ws = new WebSocket('http://' + config.server + ':' + config.port + '/send?token=' + token);

    ws.on('open', function() {
        subscribe(profile, function(err, components) {
            if (err) return;
            ws.send(JSON.stringify(components));
        }, config.pollInterval);
    });
});
