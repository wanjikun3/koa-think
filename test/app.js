const koa   = require('koa')
const think = require('../index.js')
const { koaBody } = require('koa-body');
const app = new koa()
app.use(koaBody());
think(app,{
    root:__dirname,
    authPath:['index','auth']
})
app.listen(3000);