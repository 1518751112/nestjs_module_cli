import {REQ, RES} from '@common/type'
import {ArgumentsHost, Catch, HttpException} from '@nestjs/common'
import {HttpStatusConstant, ResponseBody} from '@common/interface'
import {BaseExceptionFilter} from '@nestjs/core'
import {headersConstant, httpStatusConstant} from '@common/constant'
import {IPUtil} from "@library/utils/ip.util";
import {LoggerProvider} from "@library/logger";
import {v4 as uuid} from 'uuid';
import {ReqRecording} from '@common/cache'

/**
 * Catch exceptions during execution and log errors
 *
 * @see: [filters](https://docs.nestjs.com/exception-filters)
 */
@Catch()
export class ExceptionCatchFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerProvider) {
    super();}

  private readonly options: HttpStatusConstant = httpStatusConstant

  public catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request: REQ = ctx.getRequest();
    const response: RES = ctx.getResponse();
    const { originalUrl, body, query, method, headers,route } = request;
    const requestId = (request.headers[headersConstant.requestId] || uuid()) as string;

    // Gets the instance code from the exception object
    const statusCode = exception instanceof HttpException ? exception.getStatus() : 400;
    // Bind the corresponding information
    let statusInfo = this.options.status.get(statusCode);;
    if (!statusInfo) {
      statusInfo = {
        code: 400,
        errorCode: 99999,
        zh: "系统异常",
        en: "System exception",
      }
    }
    // Define the response body (json)
    const data = null;
    const timestamp = Date.now();
    const code = statusInfo.code;
    const errorCode = statusInfo.errorCode;
    const message = exception.message&&exception.message!='Http Exception'?exception.message: statusInfo[this.options.language];

    let responseMessage = `|ERROR| |${method}| ${originalUrl}`;
    responseMessage += `, ip=${IPUtil.getIp(request)}`;
    responseMessage += `, requestId=${requestId}`;
    responseMessage += `, statusCode=${response.statusCode}`;
    responseMessage += `, headers=${JSON.stringify(headers)}`;
    responseMessage += `, query=${JSON.stringify(query)}`;
    responseMessage += `, body=${JSON.stringify(body)}`;
    responseMessage += `, responseBody=${JSON.stringify({ code, errorCode, message })}`;

    this.logger.error(responseMessage);
    console.log("error: ",exception)
    if(route){
      ReqRecording.push({
        type: method,
        path: route.path,
        state: true,
        time: Date.now() - request['startTime'],
      })
    }
    response.status(code);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.send({ data, code, errorCode, message, timestamp, requestId } as ResponseBody<null>);
  }
}
