// 小程序相关的云函数
const AV = require('leanengine');
const axios = require('axios');
const { wxpay, wxapi, wxpay2 } = require('../libs/wxapi');
const { requireValidate, mul } = require('../libs/utils');

/**
 * 生成小程序二维码
 * 参数参考：https://mp.weixin.qq.com/debug/wxadoc/dev/api/qrcode.html
 * type:
 * 1: 通过该接口生成的小程序码，永久有效，数量限制见文末说明，请谨慎使用。
 *    用户扫描该码进入小程序后，将直接进入 path 对应的页面。
 * 2: 通过该接口生成的小程序码，永久有效，数量暂无限制。
 * 3: 数量有限制，和1的区别是二维码是普通的二维码
 */
AV.Cloud.define('getwxacode', function (request, response) {
    const params = request.params;
    const requireParams = ['type'];
    let url;

    switch (params.type) {
        case 1:
            url = 'https://api.weixin.qq.com/wxa/getwxacode';
            requireParams.push('path');
            break;
        case 2:
            url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit';
            requireParams.push('page');
            requireParams.push('scene');
            break;
        case 3:
            url = 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode';
            requireParams.push('path');
            break;
    }
    // 1. 入参验证
    requireValidate(params, requireParams).then(params => {
        // 2. 获取accessToken
        wxapi.getLatestToken((err, accessToken) => {
            // 3. 调用二维码生成接口获取二维码二进制流
            axios.post(url, params, {
                params: {
                    access_token: accessToken.accessToken,
                    dataType: 'JSON',
                },
                responseType: 'arraybuffer'
            }).then((res) => {
                // 4. 保存二维码到leancloud
                if (typeof res.data === 'undefined') {
                    return response.error('生成二维码失败');
                } else {
                    const imageFile = new AV.File('file-qrcode.png', res.data);
                    imageFile.save().then((res) => {
                        return response.success(res);
                    }, (error) => {
                        return response.error(err);
                    });
                }
            });
        });
    }).catch(err => {
        return response.error(err);
    });
})

/**
 * 发送模版信息
 * https://mp.weixin.qq.com/debug/wxadoc/dev/api/notice.html#发送模板消息
 */
AV.Cloud.define('sendTpl', function (request, response) {
    const params = request.params;
    requireValidate(params, ['touser', 'template_id', 'form_id', 'data'])
        .then(params => {
            wxapi.sendWxappTpl(params, (err, data, res) => {
                if (err) {
                    return response.error(err);
                } else {
                    return response.success(res);
                }
            });
        })
        .catch(err => {
            return response.error(err);
        });

})

// 发红包
AV.Cloud.define('redpack', function (request, response) {
    const {id, money} = request.params;
    money = parseFloat(money);
    wxpay2.createEnterprisePay({
        // openid: 'o0mga0WxBMGPF8ANZd6YsLU2qsL0',
        openid: id,
        desc: '纪成赢-中奖红包',
        partner_trade_no: '123426900220150325' + Math.random().toString().substr(2, 10),
        amount: mul(money, 100),
        spbill_create_ip: request.meta.remoteAddress
      }, function (err, result) {
        if (result.result_code == 'SUCCESS') {
            response.success(result);
          } else {
            response.error(result.err_code_des);
          }
      });
});