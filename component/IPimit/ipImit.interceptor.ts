import {catchError, Observable, of, throwError} from 'rxjs'
import {map} from 'rxjs/operators'
import {REQ, RES} from '@common/type'
import {CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor} from '@nestjs/common'
import { Reflector } from '@nestjs/core/services'
import {SuperRedis} from "@sophons/redis";
import {RedisProvider} from "@library/redis";
import {API_IP_LIMIT, LimitConfig} from "./ipImit";

/**
 * 线程锁拦截器
 * 相同的请求且数据相同的情况下，进行队列处理
 */
@Injectable()
export class IpImitInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) {
        this.redisClient = RedisProvider.redisClient;
    }
    private readonly redisClient:SuperRedis;

    public async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        //从反射器中获取配置
        const cacheConfig = this.reflector.get<LimitConfig>(API_IP_LIMIT, ctx.getHandler())
        if (!cacheConfig||!this.redisClient) {
            return next.handle();
        }
        const request: REQ = ctx.switchToHttp().getRequest()
        const {originalUrl,  method,ip} = request
        const _ip = ip.replace('::ffff:','').split(',')[0]
        const client = this.redisClient.client;
        let {key,num,interval} = cacheConfig
        num = num||10;
        interval = interval||60;
        const cne = key+_ip;
        let data = await client.get(cne);
        const _data = data?JSON.parse(data):{count:0};
        if(_data.count>=num){

            throw new HttpException('请求过于频繁', 400);
        }
        const a = {
            count:_data.count+1,
            endTime:_data.endTime||Date.now()+interval*1000
        }
        const del = Math.floor((a.endTime-Date.now())/1000)
        await client.set(cne,JSON.stringify(a),'EX',del)
        return next.handle()
    }
}
