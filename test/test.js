var request = require('supertest');
var app = require('./server');

describe('Test koa-scheme', function () {
  it('*', function () {
    request(app.callback())
      .get('/abc')
      .expect(400)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('404', function () {
    request(app.callback())
      .get('/abc')
      .set('version', 1)
      .expect(404)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('/users without version', function () {
    request(app.callback())
      .get('/users')
      .expect(400)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('/users', function () {
    request(app.callback())
      .get('/users')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('GET /user/nswbmw 200', function () {
    request(app.callback())
      .get('/user/nswbmw')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('GET /user/nswbmw2 500', function () {
    request(app.callback())
      .get('/user/nswbmw2')
      .set('version', 1)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('POST /user/nswbmw2 200', function () {
    request(app.callback())
      .post('/user/nswbmw2')
      .set('version', 1)
      .send({name: 'nswbmw2', age: 23, email: 'nswbmw1992@gmail.com'})
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('POST /user/nswbmw2 400', function () {
    request(app.callback())
      .post('/user/nswbmw2')
      .set('version', 1)
      .send({err: 'err'})
      .expect(400)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('DELETE /user/nswbmw 200', function () {
    request(app.callback())
      .delete('/user/nswbmw')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
  it('GET /user/nswbmw 500', function () {
    request(app.callback())
      .get('/user/nswbmw')
      .set('version', 1)
      .expect(500)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
});