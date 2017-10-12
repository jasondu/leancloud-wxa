const router = require('express').Router();
const AV = require('leanengine');

router.get('/sb', (req, res) => {
    var Test = AV.Object.extend('Test');
    var test = new Test();
    test.set('name', '工作');
    test.save().then(function (todo) {
        console.log('objectId is ' + todo.id);
    }, function (error) {
        console.error(error);
    });
    res.send('hello world');
})

module.exports = router;
