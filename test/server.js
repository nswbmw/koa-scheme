var path = require('path');
var koa = require('koa');
var route = require('koa-route');
var bodyparser = require('koa-bodyparser');
var scheme = require('..');
// var conf = require('./scheme');

var app = koa();

app.use(function* (next) {
  try {
    yield next;
  } catch(e) {
    this.status = e.status;
    this.body = e.message;
  }
});

app.use(bodyparser());
app.use(scheme(path.join(__dirname, 'scheme'), {debug: true}));
// app.use(scheme(conf, {debug: true}));

var nameObj = {
  'nswbmw': {name: 'nswbmw', age: 23, email: 'nswbmw1992@gmail.com'}
};

app.use(route.get('/users', function* () {
  this.body = Object.keys(nameObj).map(function (name) {
    return nameObj[name];
  });
}));

app.use(route.get('/user/:username', function* (username) {
  this.body = nameObj[username];
}));

app.use(route.post('/user/:username', function* (username) {
  nameObj[username] = this.request.body;
  this.status = 200;
}));

app.use(route.delete('/user/:username', function* (username) {
  delete nameObj[username];
  this.status = 200;
}));

if (module.parent) {
  module.exports = app;
} else {
  app.listen(3000, function () {
    console.log('Test server listening on 3000');
  });
}