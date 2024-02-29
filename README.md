# koa-think
koa-think基于koa开发的mvc框架

### 目录结构
```
├─app.js
├─model
|   └user.js
├─controller
|     ├─auth.js
|     └─index.js
```

### init
```
const koa   = require('koa')
const think = require('koa-think')

const app = new koa()
think(app)
app.listen(3000);
```
### model
```
// user.js
module.exports={
    name:String,
    pass:String,
    sign:Date,
    login:Date
}

```
### controller
```
// index.js
module.exports = async (ctx) => {
    let data={}
    if(data){
        return 1
    }else{
        return  2
    }
}

// user.js
module.exports = {
    login: async (ctx) => {
        return {code:1,info:'login'}
    },
    sign: async (ctx) => {
        return {code:1,info:'sign'}
    },
    token: async (ctx) => {
       return {code:1,info:'token'}
    }
}
```