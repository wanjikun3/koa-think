const fs = require("fs")
const http = require( 'http' )
const mongoose = require("mongoose");
const jwt= require('jsonwebtoken');
const path= require('path')
const { pathToFileURL } = require('node:url')
/**
 * 动态加载
 * @param dir 目录
 * @returns {*[]}
 */
async function load(dir){
    let files = fs.readdirSync(dir);
    let data = [];
    for (let file of files) {
        let name = file.split('.')[0]
        try{
            data[name] = require(dir+'/' + file)
        }catch (e) {
            data[name] = await import(pathToFileURL(dir+'/' + file).href)
        }
    }
    return data
}

/**
 * think
 * @param app koa 应用
 * @param config  配置 { mongo: }
 * @returns {(function(*): Promise<void>)|*}
 */
async function think(app,option = {}){
    let defult={
        root:process.cwd(),
        controller:'controller',
        model:'model',
        uri:'mongodb://127.0.0.1:27017/test',
        authKey:'koa-think',
        authExpire:60*60*2,
        authPath:[]
    }
    let config={...defult,...option}
    app.context.config = config
    mongoose.pluralize(true)
    mongoose.connect(config.uri).then(db=>{
        app.context.db=db
    });
    let modelFile = await load(config.root+'/'+config.model);
    let models=[];
    for (let file in modelFile) {
        let name=file.split('.')[0]
        models[name]=mongoose.model(name,new mongoose.Schema(modelFile[file],{versionKey: false}))
    }
    app.context.model =(name)=>{
        return models[name]
    }
   
    app.context.controllers =await load(config.root+'/'+config.controller)
    app.use( async function (ctx,next) {
        if(ctx.path==='/'){
            ctx.path="/index"
        }
        const paths = ctx.path.split('/');
        const controller = paths[1]
        const controllers=ctx.controllers
  
        if(config.authPath.length>0 && !config.authPath.some(key=> ctx.path.startsWith('/'+key) === true )){
            
            try{
                ctx.user =await jwt.verify(ctx.request.header.authorization.split(' ')[1], config.authKey)
            }catch (e){
                if(e.message==='jwt expired'){
                    ctx.body= {code:402,info:'请刷新token'}
                }else{
                    ctx.body= {code:401,info:'请重新登录'}
                }
                return false
            }
        }
        if (controllers.hasOwnProperty(controller)) {
       
            let result = null
            if (paths.length === 2) {
                console.log(controllers,controller)
                 if (typeof (controllers[controller]) === 'function') {
                    result = await controllers[controller](ctx)
                }else if (controllers[controller].index) {
                    result = await controllers[controller].index(ctx)
                } 
            } else if (paths.length === 3 ) {
                let action =paths[2]
                if(controllers[controller].hasOwnProperty(action)){
                    result = await controllers[controller][action](ctx)
                }
            }
            if (result) {
                ctx.body = result
            }
        }
        await next()
    })
}
module.exports=think
module.exports.think=think
module.exports.default=think
module.exports.load=load
