const { wxpay } = require('./wxapi');
const _ = require('lodash');

const validateSign = results => {
  const sign = wxpay.sign(results);
  if (sign !== results.sign) {
    const error = new Error('微信返回参数签名结果不正确');
    error.code = 'INVALID_RESULT_SIGN';
    throw error;
  };
  return results;
};

const handleError = results => {
  if (results.return_code === 'FAIL') {
    throw new Error(results.return_msg);
  }
  if (results.result_code !== 'SUCCESS') {
    const error = new Error(results.err_code_des);
    error.code = results.err_code;
    throw error;
  }
  return results;
};

const requireValidate = (params, require = []) => {
    let kong = [];
    require.forEach((item) => {
        if (typeof params[item] === 'undefined') {
            kong.push(item);
        }
    })
    if (kong.length > 0) {
        throw new Error(kong.join(',') + '不能为空');
    } else {
        return new Promise((resolve) => {
            resolve(params);
        });
    }
}

module.exports = {
  validateSign,
  handleError,
  requireValidate,
};