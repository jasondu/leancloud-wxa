// 小程序相关的云函数
const AV = require('leanengine');
const axios = require('axios');
const { wxpay, wxapi } = require('../libs/wxapi');
const { requireValidate } = require('../libs/utils');

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
    requireValidate(params, requireParams).then(params => {
        wxapi.getLatestToken(function (err, accessToken) {
            // 获取小程序码
            axios.post(url, params, {
                params: {
                    access_token: accessToken.accessToken,
                    dataType: 'JSON',
                },
                responseType: 'arraybuffer'
            }).then((res) => {
                // 将二维码存储起来
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
