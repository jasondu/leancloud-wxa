const router = require('express').Router();
const AV = require('leanengine');
const Order = require('../model/order');
const { wxpay } = require('../libs/wxapi');
const { validateSign } = require('../libs/utils');
const gzwxapi = require('../libs/gzwxapi');

const format = '___-_-_ _:_:__';
const formatTime = time => 
  new Date(
    time.split('')
      .map((value, index) => value + format[index])
      .join('').replace(/_/g, '')
    );

// 微信支付成功通知
router.post('/pay-callback', wxpay.useWXCallback((msg, req, res, next) => {
  // 处理商户业务逻辑
  validateSign(msg);
  const {
    result_code,
    err_code,
    err_code_des,
    out_trade_no,
    time_end,
    transaction_id,
    bank_type,
  } = msg;
  new AV.Query(Order).equalTo('tradeId', out_trade_no).first({
    useMasterKey: true,
  }).then(order => {
    if (!order) throw new Error(`找不到订单${out_trade_no}`);
    if (order.status === 'SUCCESS') {
        // 通知商家
        new AV.Query('User').equalTo('objectId', order.get('store').get('user').id).first().then(user => {
            const storeId = order.get('store').id;
            const openid = 'oFU2Z0zETJHWlAQ7GnLm0OivkzVI';
            console.log('gz_openid:' + openid);
            // 获取订单内容
            let orderCon = [];
            let query = new AV.Query('OrderCon');
            query.equalTo('order', order).include('menu').find().then((foods) => {
                foods.forEach(function (foodItem) {
                    orderCon.push(foodItem.get('menu').get('name') + 'X' + foodItem.get('num'));
                }, this);
                // 发送通知
                const templateId = 'I2_89qfWoZu-lunqqNRN1IdcSPojoSBQ-pAv4bEe_Vc';
                const url = '';
                const data = {
                    "first": {
                        "value": "您有一份新订单",
                        "color": "#173177"
                    },
                    "keyword1": {
                        "value": orderCon.join(','),
                        "color": "#173177"
                    },
                    "keyword2": {
                        "value": accMultiply(order.get('amount'), 0.01) + "元",
                        "color": "#173177"
                    },
                    "keyword3": {
                        "value": user.get('nickName'),
                        "color": "#173177"
                    },
                    "keyword4": {
                        "value": "微信支付",
                        "color": "#173177"
                    },
                    "keyword5": {
                        "value": "无",  // 备注信息
                        "color": "#173177"
                    },
                    "remark": {
                        "value": "",
                        "color": "#173177"
                    }
                };
                let jsonInfo = {
                    touser: openid,
                    template_id: templateId,
                    url: url,
                    miniprogram: {
                        appid: process.env.WEIXIN_APPID,
                        pagepath: '/pages/order/index?id=' + storeId
                    },
                    data: data
                }
                gzwxapi.sendGzTpl(jsonInfo, function (err, data, res) {
                    // response.success(res);
                });
            });
        })
        return;
    };
    
    return order.save({
      status: result_code,
      errorCode: err_code,
      errorCodeDes: err_code_des,
      paidAt: formatTime(time_end),
      transactionId: transaction_id,
      bankType: bank_type,
    }, {
      useMasterKey: true,
    });
  }).then(() => {
    res.success();
  }).catch(error => res.fail(error.message));
}));

module.exports = router;
