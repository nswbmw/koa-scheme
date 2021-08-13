var path = require('path');
var Koa = require('koa');
var route = require('koa-route');
var bodyparser = require('koa-bodyparser');
var scheme = require('..');

var app = new Koa();

app.use(async function (ctx, next) {
  try {
    await next();
  } catch(e) {
    ctx.status = e.status;
    ctx.body = e.message;
  }
});

app.use(bodyparser());
app.use(scheme(path.join(__dirname, 'scheme'), {debug: true}));

var nameObj = {
  'example': {name: 'example', age: '23', email: 'example@gmail.com'}
};

app.use(route.get('/users', function (ctx) {
  ctx.body = Object.keys(nameObj).map(function (name) {
    return nameObj[name];
  });
}));

app.use(route.get('/user/:username', function (ctx, username) {
  ctx.body = nameObj[username];
}));

app.use(route.post('/user/:username', function (ctx, username) {
  nameObj[username] = ctx.request.body;
  ctx.status = 200;
}));

app.use(route.delete('/user/:username', function (ctx, username) {
  delete nameObj[username];
  ctx.status = 200;
}));

if (module.parent) {
  module.exports = app;
} else {
  app.listen(3000, function () {
    console.log('Test server listening on 3000');
  });
}
