var validator = require('validator');

module.exports = {
  "/(.*)": {
    "request": {
      "header.version": "[1-9]+"
    }
  },
  "/users": {
    "request": {
      "method": "GET"
    },
    "response": {
      "body": testRes
    }
  },
  "GET /user/:username": {
    "response": {
      "body": {
        "name": "[a-zA-Z]+",
        "age": validator.isNumeric,
        "email": validator.isEmail
      }
    }
  },
  "/user/:username": {
    "request": {
      "method": "(POST|PATCH)",
      "body.name": /[a-zA-Z]+/,
      "body.age": "[0-9]{1,3}",
      "body.email": validator.isEmail
    }
  },
  "POST /user/:username": {
    "request": {
      "body": checkUser,
    }
  },
  "patch /user/:username": {
    "request": {
      "body.name": badRequest,
    }
  },
  "(delete|OPTIONS) /user/:username": {
    "response": {
      "status": 200
    }
  }
};

function testRes(arr) {
  if (arr && Array.isArray(arr) && arr.some(function (user) {return user.name === 'nswbmw'})) {
    return true;
  } else {
    return false;
  }
}

function badRequest() {
  throw new Error('badRequest');
}

function checkUser() {
  var body = this.request.body;
  if (!/[a-zA-Z]+/.test(body.name)) {
    throw new Error('name shoule match /[a-zA-Z]+/');
  }
  if (!/[0-9]{1,3}/.test(body.age)) {
    throw new Error('age shoule match /[0-9]{1,3}/');
  }
  if (!validator.isEmail(body.email)) {
    throw new Error('email invalid');
  }
  return true;
}