const onFinished = require('on-finished');
const Logger = require('le_node');
const config = require('./');

const leLogger = new Logger({
  token:'46f58e1d-90b4-4dfb-9116-de343820f0d7',
  secure: true,
  withStack: true,
  debug: !config.production
});

const log = config.production ? leLogger : console;

exports.log = log;
exports.logRequest = (req, res, next) => {
  const start = Date.now();
  onFinished(res, () => {
    const request = {};
    request['remote_addr'] = getip(req);
    request['date'] = (new Date()).toISOString();
    request['method'] = req.method;
    request['url'] = req.originalUrl || req.url;
    request['http_version'] = req.httpVersionMajor + '.' + req.httpVersionMinor;
    request['status'] = headersSent(res) ? res.statusCode : undefined;
    request['referrer'] = req.headers['referer'] || req.headers['referrer'];
    if (!request['referrer']) delete request['referrer'];
    request['user_agent'] = req.headers['user-agent'];
    request['response_time'] = Date.now() - start;
    log.info(request);
  });
  next();
};

function getip (req) {
  return req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined;
}

function headersSent (res) {
  return typeof res.headersSent !== 'boolean'
    ? Boolean(res._header)
    : res.headersSent;
}
