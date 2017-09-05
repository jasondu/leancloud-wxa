const AV = require('leanengine');
const axios = require('axios');
const { wxpay, wxapi } = require('../libs/wxapi');

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
    let url;
    if (typeof params.type === 'undefined') {
        return response.error(new Error('请输入生成二维码类型'));
    }

    switch (params.type) {
        case 1:
            url = 'https://api.weixin.qq.com/wxa/getwxacode';
            if (typeof params.path === 'undefined') { return response.error(new Error('请输入path')); }
            break;
        case 2:
            url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit';
            if (typeof params.page === 'undefined') { return response.error(new Error('请输入page')); }
            break;
        case 3:
            url = 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode';
            if (typeof params.path === 'undefined') { return response.error(new Error('请输入path')); }
            break;
    }
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
})