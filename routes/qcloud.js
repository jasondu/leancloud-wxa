const router = require('express').Router();
const AV = require('leanengine');

router.post('/sb', (req, res) => {
    var Test = AV.Object.extend('Test');
    var test = new Test();
    test.set(req.body);
    test.save().then(function (todo) {
        res.json({
            "code": 0,
            "message": "成功"
        });
    }, function (error) {
        console.error(error);
    });
})

module.exports = router;
