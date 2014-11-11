## koa-scheme

koa-scheme is a parameter validation middleware for koa. It's very easy for using, checkout ~

### Install

    npm i koa-scheme --save
    
### Usage

**scheme.json**

```
{
  "/user/:user": {
    "request": {
      "method": "(POST|PATCH)",
      "header": {
        "x-gg-user": "[a-zA-Z]+",
        "x-mm-user": "[a-zA-Z]+"
      },
      "query": {
        "vip": true
      },
      "body": {
        "name": "[a-zA-Z]+",
        "age": "[0-9]{1,2}",
        "family": {
          "sister": {
            "name": ".+",
            "age": "[0-9]{1,2}"
          },
          "mother": {...},
          "father": {...}
        }
      },
      ...
    },
    "response": {
      "body": {
        "name": "[a-zA-Z]+",
        "age": "[0-9]{1,2}",
        "family": {
          "sister": {
            "name": ".+",
            "age": "[0-9]{1,2}"
          }
        }
      }
    }
  },
  "/file/:user": {
    "request": {...},
    "response": {...}
  },
  ...
}
```

or a better way:

**scheme.js**

```
module.exports = {
  "/": {
    "request": {
      "method": "POST",
      "body": {
        "nameArr": testRequestNameArr
      }
    }
  }
}

function testRequestNameArr(arr) {
  if (arr.length === 3 && arr[1] === 'nswbmw') {
    return true;
  } else {
    return false;
  }
}
```

or:

```
module.exports = {
  "GET /user/:name": {
    "request": {
      ...
    },
    "response": {
      "body": {
        "name": "[_0-9a-zA-Z]{6, 20}"
      }
    }
  },
  "POST /user": {
    "request": {
      "body": {
        "name": "[_0-9a-zA-Z]{6, 20}"
      }
    }
  }
}
```

**app.js**

```
var koa = require('koa');
var bodyParser = require('koa-bodyparser');
var scheme = require('koa-scheme');
var conf = require('./scheme');
//var route = require('./route/');

var app = koa();
app.use(bodyParser());
app.use(function* (next) {
  try {
    yield next;
  } catch (e) {
    console.log(e.message)
  }
});
app.use(scheme(conf));

app.use(function* () {
  this.body = {
    name: "nswbmw",
    age: 23,
    family: {
      sister: {
        age: 28
      }
    }
  }
});

//route(app);
app.listen(3000, function() {
  console.log("listening on 3000")
});
```
**NB**: when use koa-bodyparser before koa-scheme, you could configure 'body' field in 'request'.

### Screenshot

```
curl -i -X POST \
    -H "Content-Type: application/json" \
    -H 'X-GG-User: gg' \
    -H 'X-MM-User: mm' \
    -d '{"name": "nswbmw", "age": 23, "family": {"sister": {"name": "sister", "age": 28}}}' \
    'http://localhost:3000/user/nswbmw?vip=true'
    
curl -i -X PATCH \
    -H "Content-Type: application/json" \
    -H 'X-GG-User: gg' \
    -H 'X-MM-User: mm' \
    -d '{"name": "nswbmw", "age": 23, "family": {"sister": {"name": "sister", "age": 28}}}' \
    'http://localhost:3000/user/nswbmw?vip=true'

curl -i -X POST \
    -H "Content-Type: application/json" \
    -H 'X-GG-User: gg' \
    -H 'X-MM-User: mm' \
    -d '{"name": "nswbmw", "age": 23, "family": {"sister": {"name": "sister", "age": 28}}}' \
    'http://localhost:3000/user/nswbmw?vip=false'

curl -i -X POST \
    -H "Content-Type: application/json" \
    -H 'X-GG-User: gg' \
    -H 'X-MM-User: mm' \
    -d '{"name": "nswbmw", "age": 23, "family": {"sister": {"name": "sister", "age": 28}}}' \
    'http://localhost:3000/user/nswbmw'

curl -i -X PATCH \
    -H "Content-Type: application/json" \
    -H 'X-GG-User: gg' \
    -H 'X-MM-User: mm' \
    -d '{"name": 23, "age": "nswbmw", "family": {"sister": {"name": "sister", "age": 28}}}' \
    'http://localhost:3000/user/nswbmw?vip=true'
```

![](https://github.com/MangroveTech/koa-scheme/blob/master/example.png?raw=true)

### License

MIT




