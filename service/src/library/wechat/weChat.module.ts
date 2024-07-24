// import { Inject, Module } from '@nestjs/common'
// import { WeChatService } from './weChat.service'
// import { RedisModule, RedisProvider } from '@library/redis'
// import { SuperRedis } from '@sophons/redis'
// import axios from 'axios'
// import { SequelizeModule } from '@nestjs/sequelize'
// import * as configs from '@common/config'
// import { WeChat } from '@common/interface'
//
// @Module({
//     imports: [RedisModule], // 导入模块
//     exports: [WeChatService], // 导出服务给其他模块注入使用
//     providers: [WeChatService], // 把服务加入ioc容器
// })
// export class WeChatModule {
//     constructor(
//         @Inject(RedisProvider.local)
//         private readonly redis: SuperRedis
//     ) {
//         // FF.定时刷新各账号token到redis
//         setTimeout(async () => {
//             await this.updateWechatToken(configs.WeAppInfo)
//         }, 0)
//         setInterval(async () => {
//             await this.updateWechatToken(configs.WeAppInfo)
//             console.log('管理access_token：更新')
//         }, 5000 * 1000)
//     }
//
//     async updateWechatToken(config: WeChat) {
//         let { appID, appSecret } = config
//         let { data } = await axios.get(
//             `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSecret}`
//         )
//         await this.redis.client.set(`wx:token:${appID}`, data.access_token)
//     }
// }
