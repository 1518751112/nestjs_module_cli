import {Observable, of} from 'rxjs'
import {map} from 'rxjs/operators'
import {REQ, RES} from '@common/type'
import {ResponseBody} from '@common/interface'
import {LoggerProvider} from '@library/logger'
import {EventEmitter} from 'events'
import {CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor} from '@nestjs/common'
import {IPUtil} from '@library/utils/ip.util'
import {catchError,throwError} from 'rxjs'
import {LockEventStatus} from "@library/lock/lock.common";
import { Reflector } from '@nestjs/core/services'
import {API_LOCK_MECHANISMS, LockConfig} from "@library/lock/lock";
import {CryptoUtil} from "@library/utils/crypt.util";
import {nanoid} from "nanoid";

/**
 * 线程锁拦截器
 * 相同的请求且数据相同的情况下，进行队列处理
 */
@Injectable()
export class LockInterceptor implements NestInterceptor {
    constructor(private reflector: Reflector) {

    }

    private eventList: EventLock[] = [];

    public async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        //拦截器在守卫后执行
        //从反射器中获取配置
        const cacheConfig = this.reflector.get<LockConfig>(API_LOCK_MECHANISMS, ctx.getHandler())
        if (!cacheConfig) {
            return next.handle();
        }
        const request: REQ = ctx.switchToHttp().getRequest()
        const {originalUrl, body, query, method} = request

        let outKey = '';
        if(cacheConfig.isQuery){
            if(cacheConfig.isQuery instanceof Function){
                outKey += cacheConfig.isQuery(query) || "";
            }else{
                outKey += query?JSON.stringify(query):"";
            }
        }
        if(cacheConfig.isBody){
            if(cacheConfig.isBody instanceof Function){
                outKey += cacheConfig.isBody(body) || "";
            }else{
                outKey += body?JSON.stringify(body):"";
            }
        }
        if(cacheConfig.isUser){
            if(cacheConfig.isUser instanceof Function){
                outKey += cacheConfig.isUser(request['user']) || "";
            }else{
                outKey += request['user']?JSON.stringify(request['user']):"";
            }
        }
        if(cacheConfig.req){
            outKey += cacheConfig.req(request) || "";
        }
        if(outKey.length>0){
            outKey = CryptoUtil.hashing(outKey)
        }
        let event = this.eventList.find(e => e.key === cacheConfig.key && e.outKey===outKey)
        if (!event) {
            event = new EventLock();
            event.key = cacheConfig.key;
            event.outKey = outKey;
            event.events = new EventEmitter();
            //设置最大监听数
            event.events.setMaxListeners(1000);
            this.eventList.push(event);
        }
        // const response: RES = ctx.switchToHttp().getResponse()
        const skuKey = Date.now() + nanoid(8)
        if(event.skuKeyList.length==0&&event.eventStatus==LockEventStatus.ready){
            event.eventStatus = LockEventStatus.pending;
            return next.handle().pipe(
                map((data: ResponseBody<any>) => {
                    //正确截拦
                    const skuKey = event.skuKeyList.shift()
                    event.eventStatus = LockEventStatus.ready;
                    if(skuKey)event.events.emit(skuKey)
                    return data
                }), catchError((err: HttpException) => {
                    //报错截拦
                    const skuKey = event.skuKeyList.shift()
                    event.eventStatus = LockEventStatus.ready;
                    if(skuKey)event.events.emit(skuKey)
                    return throwError(err);
                }))
        }else{
            event.skuKeyList.push(skuKey)
            return new Promise((resolve, reject) => {
                event.events.once(skuKey, (data, err) => {
                    resolve(next.handle().pipe(
                        map((data: ResponseBody<any>) => {
                            //正确截拦
                            const skuKey = event.skuKeyList.shift()
                            if(skuKey)event.events.emit(skuKey)
                            return data
                        }), catchError((err: HttpException) => {
                            //报错截拦
                            const skuKey = event.skuKeyList.shift()
                            if(skuKey)event.events.emit(skuKey)
                            return throwError(err);
                        })))

                    // resolve()
                })

            })
        }


    }
}

//
export class EventLock{
    public key:string;
    public outKey:string;
    public events:EventEmitter;
    public eventStatus:string=LockEventStatus.ready;
    public skuKeyList:string[] = [];
}
