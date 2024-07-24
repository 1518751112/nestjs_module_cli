// import { HttpException, Inject, Injectable } from '@nestjs/common'
// import axios from 'axios'
// import * as crypto from 'crypto'
// import { RedisProvider } from '@library/redis'
// import { SuperRedis } from '@sophons/redis'
// import _ = require('lodash')
// import * as fs from 'fs'
// import * as path from 'path'
// import * as WXPay from '@tg1518/weixin-pay'
// import { InjectModel } from '@nestjs/sequelize'
// import { User } from '@model/user.model'
// import { decryptData256, parseXML } from '@common/util'
// import { LodashRangeStepRight } from 'lodash/fp'
// import { Aide } from '@library/utils/aide'
// import {LogExternalAPIRequest} from "@model/index";
// import * as configs from '@common/config'
// import {BusinessInfo} from "@common/interface";
//
// interface wxOrder {
//     appID: string
//     mch_id: string
//     partner_key: string
//     pfxName:string
//     out_trade_no: string
// }
// export class WeChatService {
//     constructor(
//         @Inject(RedisProvider.local)
//         private readonly redis: SuperRedis,
//     ) {}
//     // FF.code换取openid，保存session和unionid等(必须使用）
//     public async getOpenID(code: string, appID: string, appSecret: string) {
//         let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appID}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`
//         let a = await axios.get(url)
//         let { openid, session_key, unionid } = a.data
//         // 将用户信息添加到redis
//         await this.redis.client.hmset(`wx:${appID}:openid:${openid}`, {
//             openid,
//             session_key,
//             unionid,
//         })
//         // 记录日志
//         /*await this.logExternalAPIRequestModel.create({
//           url,
//           headers: null,
//           request: null,
//           response: a.data,
//         })*/
//         return { openid, session_key, unionid }
//     }
//     // FF.获取加密信息，如用户手机号和用户信息
//     public async getEncryptedData(openid: string, encryptedData1: string, iv1: string, appID: string) {
//         let { session_key } = await this.redis.client.hgetall(`wx:${appID}:openid:${openid}`)
//         console.log(appID, session_key, openid, encryptedData1, iv1)
//         var sessionKey: Buffer = new Buffer(session_key, 'base64')
//         var encryptedData: Buffer = new Buffer(encryptedData1, 'base64')
//         var iv: Buffer = new Buffer(iv1, 'base64')
//         try {
//             var decipher: any = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
//             decipher.setAutoPadding(true)
//             var decoded: any = decipher.update(encryptedData, 'binary', 'utf8')
//             decoded += decipher.final('utf8')
//
//             decoded = JSON.parse(decoded)
//         } catch (err) {
//             throw new Error('Illegal Buffer')
//         }
//         if (decoded.watermark.appid !== appID) {
//             throw new Error('Illegal Buffer By ID')
//         }
//
//         return decoded
//     }
//     // FF.发送订阅消息(小程序)
//     /*  public async subscribeMessageSend(openid: string, templateID: string, data: any, page: string = 'index') {
//       let token = await this.getToken()
//       let body = {
//         touser: openid,
//         template_id: templateID,
//         miniprogram_state: this.configs.info.miniprogramLinkState,
//         page,
//         data: _.mapValues(data, (value) => ({ value })),
//       }
//       console.log(body)
//       let url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`
//       let a = await axios.post(url, body)
//       /!*await this.logExternalAPIRequestModel.create({
//         url,
//         headers: null,
//         request: body,
//         response: a.data,
//       })*!/
//       return a.data
//     }*/
//
//     //微信支付
//     public async createPay(openid:string,itemName: string, mount: Number, orderNo: string, notifyUrl: string, ip: string,businessInfo:BusinessInfo) {
//         let params = {
//             openid,
//             body: itemName,
//             detail: itemName,
//             out_trade_no: orderNo,
//             total_fee: mount,
//             spbill_create_ip: ip,
//             notify_url: notifyUrl,
//         }
//         // console.log("params===1",params)
//         let wxpay = this.getWXPay(businessInfo)
//         // console.log('wxpay: ', params, wxpay)
//         let ret = await new Promise((resolve, reject) => {
//             wxpay.getBrandWCPayRequestParams(params, function (err, result) {
//                 if (err) {
//                     reject(err)
//                 } else {
//                     resolve(result)
//                 }
//             })
//         })
//         // 记录日志
//         await LogExternalAPIRequest.create({
//             url: "createRefund",
//             headers: null,
//             request: params,
//             response: ret,
//         });
//         return ret
//     }
//     // FF.验证微信支付
//     public verifyPay(body: any, partner_key: string): boolean {
//         let { sign } = body
//         delete body.sign
//
//         let localSign = this.wechatSign(body, partner_key)
//         console.log('compareSign: ', sign, localSign)
//         return sign == localSign
//     }
//     // FF.验证微信退款解密
//     public async parseRefundBody(body: any, partner_key: string) {
//         let { req_info } = body
//         let infoXML = decryptData256(req_info, partner_key)
//         return await parseXML(infoXML)
//     }
//
//     // 获取 小程序二维码(推荐有礼 访问小程序首页)
//     public async getUnlimited(pathName: string, scene: string, token: string, base64: Boolean = false) {
//         let restlt = null
//         const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`
//         const request = {
//             pathName,
//             scene,
//         }
//         const res = await axios.post(url, request, {
//             responseType: 'arraybuffer',
//         })
//         let buf = Buffer.from(res.data, 'binary')
//         if (base64) {
//             restlt = 'data:image/jpg;base64,' + buf.toString('base64')
//         } else {
//             restlt = await Aide.bufferUpOSS(buf)
//         }
//         return restlt
//     }
//
//     // FF.接口生成的小程序码
//     public async getwxacodeunlimit(scene: string = null, token: string = null, page: string = undefined) {
//         console.log('scene: ', scene, page)
//         let body = {
//             page,
//             scene,
//         }
//         let url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`
//         let res = await axios.post(url, body, { responseType: 'arraybuffer' })
//         console.log('res: ', url, body)
//
//         return res.data
//     }
//
//     // FF.创建微信退款
//     public async createRefund(
//         refundNo: string,
//         payAmount: number,
//         refundAmount: number,
//         transactionID: string,
//         notifyUrl: string,
//         businessInfo:BusinessInfo
//     ) {
//         let { app_id, mchId, partner_key, pfxName } = businessInfo
//
//         let wxpay = this.getWXPay(businessInfo);
//         var params = {
//             appid: app_id,
//             mch_id: mchId,
//             out_refund_no: refundNo,//退款单号
//             total_fee: payAmount, //原支付金额
//             refund_fee: refundAmount, //退款金额
//             transaction_id: transactionID,//交易单号
//             notify_url: notifyUrl,
//         };
//         let ret = await new Promise((resolve, reject) => {
//             wxpay.refund(params, function (err, result) {
//                 if (err) {
//                     reject(err);
//                 } else {
//                     resolve(result);
//                 }
//             });
//         });
//         // 记录日志
//         await LogExternalAPIRequest.create({
//             url: "createRefund",
//             headers: null,
//             request: params,
//             response: ret,
//         });
//         return ret;
//     }
//
//     // FF.发送模板消息(公众号) 使用/message/wxopen/template/uniform_send 解决openid问题
//     /*  public async templateMessageSend(
//           openid: string, //需要与 access_token 是同一个小程序
//           templateID: string,
//           data: any,
//           url?: string,
//           miniprogram?: {
//             appid: string;
//             pagepath: string;
//           }
//       ) {
//         let token = await this.getToken(this.configs.info.weapp.appID); // openid 来源平台
//         let body = {
//           touser: openid,
//           mp_template_msg: {
//             appid: configs.info.thePublic.appID,//公众号appid
//             template_id: templateID,
//             url,
//             miniprogram,
//             data,
//           },
//           // template_id: templateID,
//           // miniprogram_state: this.configs.info.miniprogramLinkState,
//           // url,
//           // data,
//           // miniprogram,
//         };
//         // console.log(body);
//         let urlTo = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/uniform_send?access_token=${token}`;
//         let a = await axios.post(urlTo, body);
//         // console.log(11111111, { urlTo, body });
//
//         // 记录日志
//         await LogExternalAPIRequest.create({
//           url: urlTo,
//           headers: null,
//           request: body,
//           response: a.data,
//         });
//         return a.data;
//       }*/
//
//
//     //wx查询订单
//     public async findOrder(config:wxOrder){
//         let {out_trade_no,mch_id,appID,pfxName,partner_key} = config
//         let wxpay = this.getWXPay({
//             app_id:appID,
//             mchId:mch_id,
//             partner_key,
//             pfxName
//         })
//         let ret = await new Promise((resolve, reject) => {
//             wxpay.queryOrder({out_trade_no}, function (err, result) {
//                 if (err) {
//                     reject(err)
//                 } else {
//                     resolve(result)
//                 }
//             })
//         })
//
//         return ret
//     }
//
//     /*--------------------- 辅助函数 ---------------------*/
//
//     private async getToken(appID: string): Promise<string> {
//         return await this.redis.client.get(`wx:token:${appID}`)
//     }
//     private wechatSign(sendObj, key) {
//         let arr = []
//         for (let key in sendObj) {
//             arr.push(key + '=' + sendObj[key])
//         }
//         arr.sort((a, b) => (a > b ? 1 : -1))
//         let str = `${arr.join('&')}&key=${key}`
//         let ret = this.md5(str).toUpperCase()
//         return ret
//     }
//     private md5(p_value) {
//         return crypto.createHash('md5').update(p_value, 'utf8').digest('hex')
//     }
//
//     private getWXPay(b:BusinessInfo): any {
//         const {app_id,mchId,partner_key,pfxName} = b;
//         // console.log("b====",b)
//         let body = {
//             appid: app_id,
//             mch_id:mchId,
//             partner_key,
//             pfx: fs.readFileSync(path.join(__dirname, '../../../config', pfxName)),
//         }
//         return WXPay(body)
//     }
//
// }
