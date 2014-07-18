## koa-scheme

koa-scheme is a parameter validation middleware for koa. It's very easy for using, checkout ~

### Install

    npm i koa-scheme --save
    
### Usage

**shceme.json**

```
{
  "/user/:user": {
    "request": {
      "method": "(POST|PATCH|GET)",
      "header": {
        "X-GG-User": "[a-zA-Z]+",
        "X-MM-User": "[a-zA-Z]+"
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
**app.js**

```
var koa = require('koa');
//var bodyParser = require('koa-bodyparser');
var scheme = require('scheme');
var conf = require('./scheme.json');
//var route = require('./route/');

var app = koa();
//app.use(bodyParser());
app.use(scheme(conf));

//route(app);
app.listen(3000, function() {
  console.log("listening on 3000")
});
```
**NB**: when use koa-bodyparser before koa-scheme, you could configure 'body' field in 'request'.

### Screenshot

![](https://github.com/nswbmw/koa-scheme/blob/master/example.png?raw=true)

### Lisence

MIT




