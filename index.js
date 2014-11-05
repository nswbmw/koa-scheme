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
    var _conf;
    var _method;
    var _path;

    Object.keys(conf).forEach(function (path) {
      if (pathToRegexp(path).test(ctx.path)) {
        if (!conf[path].request ||
          !conf[path].request.method ||
          RegExp(conf[path].request.method, "i").test(ctx.method)) {
          _conf = conf[path];
          _method = ctx.method;
          _path = ctx.path;

          debug('%s %s -> %s', _method, _path, path);
          return;
        }
      }
    });

    if (_conf) {
      flat_conf_request = flatten(_conf.request || {});
      flat_ctx_request = flatten(filterFunc(ctx.request) || {}, {safe: true});

      Object.keys(flat_conf_request).forEach(function (key) {
        if (!flat_ctx_request[key]) {
          debug('%s %s -> %s', _method, _path, key + ' : Not exist!');
          ctx.throw(400, _method + ' ' + _path + ' -> ' + key + ' : Not exist!');
        }
        if (typeof flat_conf_request[key] === 'function') {
          if(!flat_conf_request[key](flat_ctx_request[key])) {
            ctx.throw(400, _method + ' ' + _path + ' -> ' + key + ' : ' + flat_ctx_request[key] + ' ✖ ' + '[Function: ' + (flat_conf_request[key].name || 'function') + ']');
          }
        } else {
          if (!RegExp(flat_conf_request[key]).test(flat_ctx_request[key])) {
            debug('%s %s -> %s : %s ✖ %s', _method, _path, key, flat_ctx_request[key], flat_conf_request[key]);
            ctx.throw(400, _method + ' ' + _path + ' -> ' + key + ' : ' + flat_ctx_request[key] + ' ✖ ' + flat_conf_request[key]);
          }
        }
      });

      yield* next;

      flat_conf_response = flatten(_conf.response || {});
      flat_ctx_response = flatten(filterFunc(ctx.response) || {}, {safe: true});

      Object.keys(flat_conf_response).forEach(function (key) {
        if (!flat_ctx_response[key]) {
          debug('%s %s <- %s', _method, _path, key + ' : Not exist!');
          ctx.throw(500, _method + ' ' + _path + ' <- ' + key + ' : Not exist!');
        }
        if (typeof flat_conf_response[key] === 'function') {
          if(!flat_conf_response[key](flat_ctx_response[key])) {
            ctx.throw(500, _method + ' ' + _path + ' <- ' + key + ' : ' + flat_ctx_response[key] + ' ✖ ' + '[Function: ' + (flat_conf_response[key].name || 'function') + ']');
          }
        } else {
          if (!RegExp(flat_conf_response[key]).test(flat_ctx_response[key])) {
            debug('%s %s <- %s : %s ✖ %s', _method, _path, key, flat_ctx_response[key], flat_conf_response[key]);
            ctx.throw(500, _method + ' ' + _path + ' <- ' + key + ' : ' + flat_ctx_response[key] + ' ✖ ' + flat_req_response[key]);
          }
        }
      });
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