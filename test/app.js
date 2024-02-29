const koa   = require('koa')
const think = require('../index.js')

const app = new koa()
think(app,{
    root:__dirname
})
app.listen(3000);