/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var flatten = require('flat').flatten;
var debug = require('debug')('koa-scheme');

/**
 * Expose `scheme()`.
 */

module.exports = scheme;

/**
 * Check if ctx.request and ctx.response
 * satisfies the configuration file.
 *
 * @param {Object}
 * @return {Function}
 * @api public
 */

function scheme(conf) {
  try {
    conf = conf || require('./scheme.json');
  } catch(e) {}
  return function* (next) {
    var ctx = this;
    var req;
    var _method;
    var _path;
    var isError;

    Object.keys(conf).forEach(function (path) {
      try {
        if (pathToRegexp(path).test(ctx.path) &&
          RegExp(conf[path].request.method, "i").test(ctx.method)) {
          req = conf[path];
          _method = ctx.method;
          _path = ctx.path;

          debug('%s %s -> %s', _method, _path, path);
          return;
        }
      } catch(e) {}
    });

    if (req) {
      flat_req_request = flatten(req.request || {});
      flat_ctx_request = flatten(filterFunc(ctx.request) || {});

      Object.keys(flat_req_request).forEach(function (key) {
        key = key.toLowerCase();
        try {
          if (!flat_ctx_request[key]) {
            debug('%s %s -> %s', _method, _path, key + ' : Not exist!');
            throw new Error(_method + ' ' + _path + ' -> ' + key + ' : Not exist!');
          }
          if (!RegExp(flat_req_request[key]).test(flat_ctx_request[key])) {
            debug('%s %s -> %s : %s ✖ %s', _method, _path, key, flat_ctx_request[key], flat_req_request[key]);
            throw new Error(_method + ' ' + _path + ' -> ' + key + ' : ' + flat_ctx_request[key] + ' ✖ ' + flat_req_request[key]);
          }     
        } catch(e) {
          ctx.status = 400;
          ctx.body = e.toString();
          isError = true;
          return;
        }
      });

      if (!isError) {
        yield* next;

        flat_req_response = flatten(req.response || {});
        flat_ctx_response = flatten(filterFunc(ctx.response) || {});

        Object.keys(flat_req_response).forEach(function (key) {
          key = key.toLowerCase();
          try {
            if (!flat_ctx_response[key]) {
              debug('%s %s <- %s', _method, _path, key + ' : Not exist!');
              throw new Error(_method + ' ' + _path + ' <- ' + key + ' : Not exist!');
            }
            if (!RegExp(flat_req_response[key]).test(flat_ctx_response[key])) {
              debug('%s %s <- %s : %s ✖ %s', _method, _path, key, flat_ctx_response[key], flat_req_response[key]);
              throw new Error(_method + ' ' + _path + ' <- ' + key + ' : ' + flat_ctx_response[key] + ' ✖ ' + flat_req_response[key]);
            }     
          } catch(e) {
            ctx.status = 500;
            ctx.body = e.toString();
            return;
          }
        });
      }
    }
  }
}

/**
 * Only return readable attributes in 
 * ctx.request and ctx.response.
 *
 * @param {Object}
 * @return {Object}
 * @api private
 */

function filterFunc(request) {
  var _request = {};
  ["header", "method", "url", "originalUrl", "path", "query", 
  "querystring", "host", "hostname", "fresh", "stale", 
  "protocol", "secure", "ip", "ips", "subdomains", 
  "body", "status", "length", "type", "headerSent"].forEach(function (item) {
    if (request[item]) _request[item] = request[item];
  });
  return _request;
}