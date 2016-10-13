'use strict';

/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var flatten = require('flat').flatten;
var debug = require('debug')('koa-scheme');
var methods = require('methods');

/**
 * Check if ctx.request and ctx.response
 * satisfies the configuration file.
 *
 * @param {Object|String}
 * @return {Function}
 * @api public
 */

module.exports = function (conf, options) {
  if ('string' === typeof conf) {
    conf = require(conf);
  }
  if (Object.prototype.toString.call(conf) !== '[object Object]') {
    throw new Error('No scheme.');
  }
  options = options || {};

  var _conf = {};

  var pathReg = new RegExp('(' + methods.join('|') + ')\\S*\\s+\/', 'i');
  Object.keys(conf).forEach(function (path) {
    // eg: 'GET /user/:userId'
    if (pathReg.test(path)) {
      _conf[path] = conf[path];
    } else {
      // eg: '/user/:userId', request.method: 'GET'
      _conf[((conf[path].request || {}).method || '(.+)') + ' ' + path] = conf[path];
    }
  });

  // flat object, but preserve array, see: https://www.npmjs.com/package/flat#safe
  Object.keys(_conf).forEach(function (path) {
    if (_conf[path].request) _conf[path].request = flatten(_conf[path].request, {safe: true});
    if (_conf[path].response) _conf[path].response = flatten(_conf[path].response, {safe: true});
  });

  if (options.debug) console.log(_conf);

  return function* scheme (next) {
    var ctx = this;
    var matchArr = [];

    var ctx_path = ctx.method + ' ' + ctx.path;
    Object.keys(_conf).forEach(function (path) {
      if (pathToRegexp(path).test(ctx_path)) {
        matchArr.push(_conf[path]);
      }
    });

    // request
    matchArr.forEach(function (expect) {
      var flat_conf_request = expect.request || {};
      var flat_ctx_request = flatten(filterFunc(ctx.request), {safe: true});

      Object.keys(flat_conf_request).forEach(function (key) {
        if ('function' === typeof flat_conf_request[key]) {
          try {
            if (!flat_conf_request[key].call(ctx, flat_ctx_request[key])) {
              if (options.debug) ctx.throw(400, JSON.stringify(flat_ctx_request[key]) + ' ✖ [Function: ' + (flat_conf_request[key].name || 'function') + ']');
            }
          } catch (e) {
            debug('%s %s <- %s : %s', ctx.method, ctx.path, key, e.message);
            ctx.throw(e.statusCode || e.status || 400, e.message);
          }
        } else {
          if (flat_ctx_request[key] === undefined) {
            debug('%s %s <- %s', ctx.method, ctx.path, key + ' : Not exist!');
            ctx.throw(400, key + ' : Not exist!');
          }
          if (!RegExp(flat_conf_request[key]).test(flat_ctx_request[key])) {
            debug('%s %s <- %s : %j ✖ %j', ctx.method, ctx.path, key, flat_ctx_request[key], flat_conf_request[key]);
            ctx.throw(400, key + ' : ' + flat_ctx_request[key] + ' ✖ ' + flat_conf_request[key]);
          }
        }
      });
    });

    if (this.status === 404) {
      yield* next;

      // response
      matchArr.forEach(function (expect) {
        var flat_conf_response = expect.response || {};
        var flat_ctx_response = flatten(filterFunc(ctx.response), {safe: true});

        Object.keys(flat_conf_response).forEach(function (key) {
          if ('function' === typeof flat_conf_response[key]) {
            try {
              if (!flat_conf_response[key].call(ctx, flat_ctx_response[key])) {
                if (options.debug) ctx.throw(500, JSON.stringify(flat_ctx_response[key]) + ' ✖ [Function: ' + (flat_conf_response[key].name || 'function') + ']');
              }
            } catch (e) {
              debug('%s %s -> %s : %s', ctx.method, ctx.path, key, e.message);
              ctx.throw(e.statusCode || e.status || 500, e.message);
            }
          } else {
            if (flat_ctx_response[key] === undefined) {
              debug('%s %s -> %s', ctx.method, ctx.path, key + ' : Not exist!');
              ctx.throw(500, key + ' : Not exist!');
            }
            if (!RegExp(flat_conf_response[key]).test(flat_ctx_response[key])) {
              debug('%s %s -> %s : %j ✖ %j', ctx.method, ctx.path, key, flat_ctx_response[key], flat_conf_response[key]);
              ctx.throw(500, key + ' : ' + flat_ctx_response[key] + ' ✖ ' + flat_conf_response[key]);
            }
          }
        });
      });
    }
  };
};

/**
 * Only return readable attributes in 
 * ctx.request and ctx.response.
 *
 * @param {Object}
 * @return {Object}
 * @api private
 */

function filterFunc(ctx) {
  var _ctx = {};
  ["header", "headers", "method", "url", "originalUrl", "origin", "href", "path", "query", 
  "querystring", "search", "host", "hostname", "type", "charset", "fresh", "stale",
  "protocol", "secure", "ip", "ips", "subdomains", 
  "body", "status", "message", "length", "headerSent", "lastModified"].forEach(function (item) {
    if (ctx[item]) _ctx[item] = ctx[item];
  });
  return _ctx;
}