import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {REQ, RES} from '@common/type'
import {ResponseBody} from '@common/interface'
import {LoggerProvider} from '@library/logger'
import {CallHandler, ExecutionContext, Injectable, NestInterceptor, StreamableFile} from '@nestjs/common'
import {IPUtil} from '@library/utils/ip.util'
import {ReqRecording} from '@common/cache'

/**
 * Log the request details
 *
 * @see: [interceptors](https://docs.nestjs.com/interceptors)
 */
@Injectable()
export class LogInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerProvider) {
    }

    public intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
        const request: REQ = ctx.switchToHttp().getRequest()
        const response: RES = ctx.switchToHttp().getResponse()
        const {originalUrl, body, query, method, headers, route} = request
        if (!request['startTime']) {
            request['startTime'] = Date.now()
        }
        let message = `|${method}| ${originalUrl}`
        message += ` |${ctx.getClass().name}|`
        message += ` |${ctx.getHandler().name}|`
        message += `, ip=${IPUtil.getIp(request)}`

        this.logger.info(message)

        return next.handle().pipe(
            map((data: ResponseBody<any>) => {
                //获取对象类型
                const isBuffer = data instanceof StreamableFile
                let responseMessage = `|SUCCESS| ${message}`
                responseMessage += `, statusCode=${response.statusCode}`
                responseMessage += `, headers=${JSON.stringify(headers)}`
                responseMessage += `, query=${JSON.stringify(query)}`
                responseMessage += `, body=${JSON.stringify(body)}`
                responseMessage += `, responseBody=${isBuffer ? '"buffer....."' : JSON.stringify(data)}`
                if(route){
                    ReqRecording.push({
                        type: method,
                        path: route.path,
                        state: true,
                        time: Date.now() - request['startTime'],
                    })
                }

                this.logger.info(responseMessage)
                return data
            })
        )
    }
}
