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