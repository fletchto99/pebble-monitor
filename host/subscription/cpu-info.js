var fs = require('fs');

/*
 * Parse output from /proc/cpuinfo
 */
module.exports = function(cb) {
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
