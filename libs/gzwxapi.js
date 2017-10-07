// 公众号
const WechatAPI = require('wechat-api');

if (!process.env.GZ_WEIXIN_APPID) throw new Error('environment variable GZ_WEIXIN_APPID missing');
if (!process.env.GZ_WEIXIN_SECRET) throw new Error('environment variable GZ_WEIXIN_SECRET missing');

const gzwxapi = new WechatAPI(process.env.GZ_WEIXIN_APPID, process.env.GZ_WEIXIN_SECRET);
WechatAPI.patch("sendGzTpl", "https://api.weixin.qq.com/cgi-bin/message/template/send");    // 发送公众号模版消息
WechatAPI.patch("createcard", "https://api.weixin.qq.com/card/create");

module.exports = gzwxapi;
