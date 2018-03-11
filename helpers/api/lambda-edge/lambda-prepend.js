
let times = [];

var timers = {};
function timer(name) {
    timers[name + '_start'] = Date.now();
}

function timerEnd(name) {
    if (!timers[name + '_start']) return undefined;
    var time = Date.now() - timers[name + '_start'];
    var amount = timers[name + '_amount'] = timers[name + '_amount'] ? timers[name + '_amount'] + 1 : 1;
    var sum = timers[name + '_sum'] = timers[name + '_sum'] ? timers[name + '_sum'] + time : time;
    timers[name + '_avg'] = sum / amount;
    delete timers[name + '_start'];
    return time;
}

promiseFn = null;
const AWS = require('aws-sdk');
