var test = require("tap").test;

test("page deploy test", function (t) {
    t.plan(1);

    t.equal(typeof Date.now, "function");
});
