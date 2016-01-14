#!/usr/bin/env node

var exec = require('child_process').exec;
var fs = require('fs');

/*
 * Parse output from /proc/cpuinfo
 */
function cpuInfo(cb) {
    fs.readFile('/proc/cpuinfo', 'utf-8', function (err, data) {
        if (err) return cb(err);

        var cpus = data.split(/\n\n+/g).filter(function(cpu) {
            return cpu;
        }).map(function(cpu) {
            return cpu.split('\n').map(function(prop) {
                return prop.split(/\s*:\s*/);
            }).reduce(function(mem, prop) {
                var key = prop[0].replace(/\s+/g, '_').toLowerCase(),
                    val = prop[1];

                mem[key] = val;
                return mem;
            }, {});
        });

        cb(false, cpus);
    });
}

/*
 * Parse output from lm-sensors
 */
function lmSensors(cb) {
    exec('sensors', function(err, stdout, stderr) {
        if (err) return cb(err);

        var sensors = stdout.split(/\n\n+/g).filter(function(cpu) {
            return cpu;
        }).map(function(sensor) {
            var properties = sensor.split('\n');
            var name = properties.shift();

            var sensor = properties.map(function(prop) {
                return prop.split(/\s*:\s*/);
            }).reduce(function(mem, prop) {
                var key = prop[0].replace(/\s+/g, '_').toLowerCase(),
                    val = prop[1];

                mem[key] = val;
                return mem;
            }, {});

            sensor.name = name;
            return sensor;
        });

        cb(false, sensors);
    });
}

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

subscribe([cpuInfo, lmSensors], function(err, components) {
    if (err) return;
    console.log(components);
}, 1000);
