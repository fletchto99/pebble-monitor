var exec = require('child_process').exec;

/*
 * Parse output from lm-sensors
 */
module.exports = function(cb) {
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
