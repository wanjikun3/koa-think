const jwt= require('jsonwebtoken');
const sha1= require('sha1')
const {now} = require("mongoose");

module.exports = {
    login: async (ctx) => {
        let user=await ctx.model('user').findOne({
            'name':ctx.request.body.name,
            'pass':sha1(ctx.request.body.pass)
        })
        if(user){
            user.login=now()
            user.save()
            let token= jwt.sign({id:user.id,name:user.name}, ctx.config.authKey,{expiresIn: ctx.config.authExpire});
            let refreshToken= jwt.sign({id:user.id,name:user.name}, ctx.config.authKey+'_refresh',{expiresIn: '30d'});
            return {code:0,info:'登录成功',token,refreshToken}
        }else{
            return {code:1,info:'用户名或密码错误',token:''}
        }
    },
    sign: async (ctx) => {
        let user=await ctx.model('user').findOne({
            'name':ctx.request.body.name,
        })
        if(user){
            return {code:0,info:ctx.request.body.name+'已注册'}
        }
        let data={
            'name':ctx.request.body.name,
            'pass':sha1(ctx.request.body.pass),
            'sign':now()
        }
        console.log(data)
        user=await ctx.model('user').create(data)
        return {code:0,info:'注册成功'}
    },
    /**
     * 刷新token
     * @param ctx
     * @returns {Promise<{code: number, info: string}|{code: number, token: (*), refreshToken: (*)}>}
     */
    token: async (ctx) => {
        try{
            let user = await jwt.verify(ctx.request.body.token, ctx.config.authKey+'_refresh')
            let token = jwt.sign({id:user.id,name:user.name}, ctx.config.authKey,{expiresIn: ctx.config.authExpire});
            let refreshToken = jwt.sign({id:user.id,name:user.name}, ctx.config.authKey+'_refresh',{expiresIn: '30d'});
            return {code:0,token,refreshToken}
        }catch (e){
            return {code:401,info:'刷新令牌验证失败'}
        }
    },
    index: async()=>{
        return {code:0,info:'test'}
    }
}