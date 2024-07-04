const onFinished = require('on-finished');
require('dotenv').config();

exports.log = console;
exports.logRequest = (req, res, next) => {
  const start = Date.now();
  onFinished(res, () => {
    const request = {};
    request['remote_addr'] = getip(req);
    request['date'] = new Date().toISOString();
    request['method'] = req.method;
    request['url'] = req.originalUrl || req.url;
    request['http_version'] = req.httpVersionMajor + '.' + req.httpVersionMinor;
    request['status'] = headersSent(res) ? res.statusCode : undefined;
    request['referrer'] = req.headers['referer'] || req.headers['referrer'];
    if (!request['referrer']) delete request['referrer'];
    request['user_agent'] = req.headers['user-agent'];
    request['response_time'] = Date.now() - start;
    console.info(request);
  });
  next();
};

function getip(req) {
  return (
    req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    undefined
  );
}

function headersSent(res) {
  return typeof res.headersSent !== 'boolean'
    ? Boolean(res._header)
    : res.headersSent;
}
