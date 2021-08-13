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
        if (res.body.length !== 1 || res.body[0].name !== 'example' || res.body[0].email !== 'example@gmail.com') {
          return done('res.body should be `[{"name":"example","age":"23","email":"example@gmail.com"}]`');
        }
        done();
      });
  });
  it('GET /user/example 200', function (done) {
    request(app.callback())
      .get('/user/example')
      .set('version', 1)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.body.name !== 'example' || res.body.email !== 'example@gmail.com') {
          return done('res.body should be `{"name":"example","age":"23","email":"example@gmail.com"}`');
        }
        done();
      });
  });
  it('GET /user/example2 500', function (done) {
    request(app.callback())
      .get('/user/example2')
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
  it('POST /user/example2 200', function (done) {
    request(app.callback())
      .post('/user/example2')
      .set('version', 1)
      .send({name: 'example2', age: '23', email: 'example@gmail.com'})
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'OK') {
          return done('res.text should be `OK`');
        }
        done();
      });
  });
  it('POST /user/example2 400', function (done) {
    request(app.callback())
      .post('/user/example2')
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
  it('PATCH /user/example3 400', function (done) {
    request(app.callback())
      .patch('/user/example3')
      .set('version', 1)
      .send({name: 'example3', age: '23', email: 'example@gmail.com'})
      .expect(400)
      .end(function (err, res) {
        if (err) return done(err);
        if (res.text !== 'This is a bad request') {
          return done('res.text should be `This is a bad request`');
        }
        done();
      });
  });
  it('DELETE /user/example 200', function (done) {
    request(app.callback())
      .delete('/user/example')
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
  it('GET /user/example 500', function (done) {
    request(app.callback())
      .get('/user/example')
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
