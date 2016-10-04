"use strict";
let core, config, logger, apikey;

let serviceName = 'luosimao';
let luosimao = {
  assert: (error) => {
    if (error) {
      logger.error(error);
      throw '[' + serviceName + '] ' + error;
    }
  },
  init: (name, c) => {
    serviceName = name;
    core = c;
    logger = core.getLogger(serviceName);
    config = core.getConfig(serviceName);
    apikey = config.password || '';
    if (!config.enable_api) {
      // disable api
      delete luosimao.post_send;
    }
  },
  send: (mobile, message, next) => {
    let content = require('querystring').stringify({
      mobile: mobile,
      message: message
    });
    let options = {
      host: 'sms-api.luosimao.com',
      path: '/v1/send.json',
      method: 'POST',
      auth: 'api:key-' + apikey,
      agent: false,
      rejectUnauthorized : false,
      headers: {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' :content.length
      }
    };
    let result = '', req = require('https').request(options, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        result += chunk;
      });
      res.on('end', () => {
        result = JSON.parse(result);
        next(result);
      });
    });
    req.write(content);
    req.end();
  },
  post_send: (req, res, next) => {
    if (!req.body || req.body.mobile === undefined || req.body.message === undefined) {
      throw 'Params is wrong';
    }
    luosimao.send(req.body.mobile, req.body.message, next);
  }
};

module.exports = luosimao;
