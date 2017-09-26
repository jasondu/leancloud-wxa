const AV = require('leanengine');
const { wxpay } = require('../libs/wxapi');
const {
  validateSign,
  handleError,
} = require('../libs/utils');

class Order extends AV.Object {
    get tradeId() { return this.get('tradeId'); }
    set tradeId(value) { this.set('tradeId', value); }
    
    get amount() { return this.get('amount'); }
    set amount(value) { this.set('amount', value); }
    
    get user() { return this.get('user'); }
    set user(value) { this.set('user', value); }
    
    get productDescription() { return this.get('productDescription'); }
    set productDescription(value) { this.set('productDescription', value); }
    
    get status() { return this.get('status'); }
    set status(value) { this.set('status', value); }
    
    get ip() { return this.get('ip'); }
    set ip(value) { this.set('ip', value); }
    
    get tradeType() { return this.get('tradeType'); }
    set tradeType(value) { this.set('tradeType', value); }
  
    get prepayId() { return this.get('prepayId'); }
    set prepayId(value) { this.set('prepayId', value); }
  
    get con() { return this.get('con'); }
    set con(value) { this.set('con', value); }
  
    get address() { return this.get('address'); }
    set address(value) { this.set('address', value); }
  
    get userphone() { return this.get('userphone'); }
    set userphone(value) { this.set('userphone', value); }
  
    get username() { return this.get('username'); }
    set username(value) { this.set('username', value); }
  
    get store() { return this.get('store'); }
    set store(value) { this.set('store', value); }
  
    get dostatus() { return this.get('dostatus'); }
    set dostatus(value) { this.set('dostatus', value); }
  
  place() {
    return new Promise((resolve, reject) => {
      // 参数文档： https://pay.weixin.qq.com/wiki/doc/api/wxa/wxa_api.php?chapter=9_1
      wxpay.createUnifiedOrder({
        openid: this.user.get('authData').lc_weapp.openid,
        body: this.productDescription,
        out_trade_no: this.tradeId,
        total_fee: this.amount,
        spbill_create_ip: this.ip,
        notify_url: process.env.WEIXIN_NOTIFY_URL,
        trade_type: this.tradeType,
      }, function(err, result) {
        console.log(err, result);
        if (err) return reject(err);
        return resolve(result);
      });
    }).then(handleError).then(validateSign).then(({
      prepay_id,
    }) => {
      this.prepayId = prepay_id;
      return this.save();
    });
  }
} 
AV.Object.register(Order);

module.exports = Order;