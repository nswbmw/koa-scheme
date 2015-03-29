/**
 * Module dependencies.
 */

var pathToRegexp = require('path-to-regexp');
var flatten = require('flat').flatten;
var debug = require('debug')('koa-scheme');
var methods = require('methods');

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

function scheme(conf, options) {
  if (!conf || 'object' !== typeof conf) {
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

  return function* (next) {
    var ctx = this;
    var matchArr = [];

    var ctx_path = ctx.method + ' ' + ctx.path;
    Object.keys(_conf).forEach(function (path) {
      if (pathToRegexp(path).test(ctx_path)) {
        matchArr.push(_conf[path]);
      }
    });

    // request
    matchArr.forEach(function (rule) {
      var flat_conf_request = rule.request || {};
      var flat_ctx_request = flatten(filterFunc(ctx.request), {safe: true});

      Object.keys(flat_conf_request).forEach(function (key) {
        if (flat_ctx_request[key] === undefined) {
          debug('%s %s <- %s', ctx.method, ctx.path, key + ' : Not exist!');
          if (options.debug) return ctx.throw(400, key + ' : Not exist!');
        }
        if ('function' === typeof flat_conf_request[key]) {
          if(!flat_conf_request[key].call(ctx, flat_ctx_request[key])) {
            debug('%s %s <- %s : %s ✖ [Function: %s]', ctx.method, ctx.path, key, flat_ctx_request[key], (flat_conf_request[key].name || 'function'));
            if (options.debug) return ctx.throw(400, key + ' : ' + flat_ctx_request[key] + ' ✖ [Function: ' + (flat_conf_request[key].name || 'function') + ']');
          }
        } else {
          if (!RegExp(flat_conf_request[key]).test(flat_ctx_request[key])) {
            debug('%s %s <- %s : %s ✖ %s', ctx.method, ctx.path, key, flat_ctx_request[key], flat_conf_request[key]);
            if (options.debug) return ctx.throw(400, key + ' : ' + flat_ctx_request[key] + ' ✖ ' + flat_conf_request[key]);
          }
        }
      });
    });

    if (this.status === 404) {
      yield* next;

      // response
      matchArr.forEach(function (rule) {
        var flat_conf_response = rule.response || {};
        var flat_ctx_response = flatten(filterFunc(ctx.response), {safe: true});

        Object.keys(flat_conf_response).forEach(function (key) {
          if (flat_ctx_response[key] === undefined) {
            debug('%s %s -> %s', ctx.method, ctx.path, key + ' : Not exist!');
            if (options.debug) return ctx.throw(500, key + ' : Not exist!');
          }
          if ('function' === typeof flat_conf_response[key]) {
            if(!flat_conf_response[key].call(ctx, flat_ctx_response[key])) {
              debug('%s %s -> %s : %s ✖ [Function: %s]', ctx.method, ctx.path, key, flat_ctx_response[key], (flat_conf_response[key].name || 'function'));
              if (options.debug) return ctx.throw(500, key + ' : ' + flat_ctx_response[key] + ' ✖ [Function: ' + (flat_conf_response[key].name || 'function') + ']');
            }
          } else {
            if (!RegExp(flat_conf_response[key]).test(flat_ctx_response[key])) {
              debug('%s %s -> %s : %s ✖ %s', ctx.method, ctx.path, key, flat_ctx_response[key], flat_conf_response[key]);
              if (options.debug) return ctx.throw(500, key + ' : ' + flat_ctx_response[key] + ' ✖ ' + flat_conf_response[key]);
            }
          }
        });
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

function filterFunc(ctx) {
  var _ctx = {};
  ["header", "headers", "method", "url", "originalUrl", "path", "query", 
  "querystring", "host", "hostname", "fresh", "stale",
  "protocol", "secure", "ip", "ips", "subdomains", 
  "body", "status", "message", "length", "type", "headerSent"].forEach(function (item) {
    if (ctx[item]) _ctx[item] = ctx[item];
  });
  return _ctx;
}