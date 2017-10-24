const WXPay = require('weixin-pay');        // 微信支付API
const WechatAPI = require('wechat-api');    // 微信公众号API
const fs = require('fs');

if (!process.env.WEIXIN_APPID) throw new Error('请到【云引擎-设置-自定义环境变量】添加 WEIXIN_APPID');
if (!process.env.WEIXIN_SECRET) throw new Error('请到【云引擎-设置-自定义环境变量】添加 WEIXIN_SECRET');
if (!process.env.WEIXIN_MCHID) throw new Error('请到【云引擎-设置-自定义环境变量】添加 WEIXIN_MCHID');
if (!process.env.WEIXIN_PAY_SECRET) throw new Error('请到【云引擎-设置-自定义环境变量】添加 WEIXIN_PAY_SECRET');
if (!process.env.WEIXIN_NOTIFY_URL) throw new Error('请到【云引擎-设置-自定义环境变量】添加 WEIXIN_NOTIFY_URL');

const wxpay = WXPay({
    appid: process.env.WEIXIN_APPID,
    mch_id: process.env.WEIXIN_MCHID,
    partner_key: process.env.WEIXIN_PAY_SECRET,
    // pfx: fs.readFileSync('./cert/apiclient_cert.p12'),  //微信商户平台证书，暂不需要
});


const wxapi = new WechatAPI(process.env.WEIXIN_APPID, process.env.WEIXIN_SECRET);
WechatAPI.patch("sendWxappTpl", "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send");
WechatAPI.patch("getwxacode", "https://api.weixin.qq.com/wxa/getwxacode");

module.exports = {
    wxpay,
    wxapi,
};