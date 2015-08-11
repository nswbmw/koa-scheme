var request = require('supertest');
var app = require('./server');

describe('Test koa-scheme', function (done) {
  it('*', function (done) {
    request(app.callback())
      .get('/abc')
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'header.version : Not exist!') {
          return done('res.text should be `header.version : Not exist!`');
        }
        done();
      });
  });
  it('404', function (done) {
    request(app.callback())
      .get('/abc')
      .set('version', 1)
      .expect(404)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'Not Found') {
          return done('res.text should be `Not Found`');
        }
        done();
      });
  });
  it('/users without version', function (done) {
    request(app.callback())
      .get('/users')
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'header.version : Not exist!') {
          return done('res.text should be `header.version : Not exist!`');
        }
        done();
      });
  });
  it('/users', function (done) {
    request(app.callback())
      .get('/users')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.body.length !== 1 || res.body[0].name !== 'nswbmw' || res.body[0].email !== 'nswbmw1992@gmail.com') {
          return done('res.body should be `[{"name":"nswbmw","age":23,"email":"nswbmw1992@gmail.com"}]`');
        }
        done();
      });
  });
  it('GET /user/nswbmw 200', function (done) {
    request(app.callback())
      .get('/user/nswbmw')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.body.name !== 'nswbmw' || res.body.email !== 'nswbmw1992@gmail.com') {
          return done('res.body should be `{"name":"nswbmw","age":23,"email":"nswbmw1992@gmail.com"}`');
        }
        done();
      });
  });
  it('GET /user/nswbmw2 500', function (done) {
    request(app.callback())
      .get('/user/nswbmw2')
      .set('version', 1)
      .expect(500)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'body.name : Not exist!') {
          return done('res.text should be `body.name : Not exist!`');
        }
        done();
      });
  });
  it('POST /user/nswbmw2 200', function (done) {
    request(app.callback())
      .post('/user/nswbmw2')
      .set('version', 1)
      .send({name: 'nswbmw2', age: 23, email: 'nswbmw1992@gmail.com'})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'OK') {
          return done('res.text should be `OK`');
        }
        done();
      });
  });
  it('POST /user/nswbmw2 400', function (done) {
    request(app.callback())
      .post('/user/nswbmw2')
      .set('version', 1)
      .send({err: 'err'})
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'body.name : Not exist!') {
          return done('res.body should be `body.name : Not exist!`');
        }
        done();
      });
  });
  it('PATCH /user/nswbmw3 400', function (done) {
    request(app.callback())
      .patch('/user/nswbmw3')
      .set('version', 1)
      .send({name: 'nswbmw3', age: 23, email: 'nswbmw1992gmail.com'})
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== '"nswbmw1992gmail.com" ✖ [Function: function]') {
          return done('res.text should be `"nswbmw1992gmail.com" ✖ [Function: function]`');
        }
        done();
      });
  });
  it('DELETE /user/nswbmw 200', function (done) {
    request(app.callback())
      .delete('/user/nswbmw')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'OK') {
          return done('res.text should be `OK`');
        }
        done();
      });
  });
  it('GET /user/nswbmw 500', function (done) {
    request(app.callback())
      .get('/user/nswbmw')
      .set('version', 1)
      .expect(500)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'body.name : Not exist!') {
          return done('res.text should be `body.name : Not exist!`');
        }
        done();
      });
  });
});