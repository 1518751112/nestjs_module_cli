//定义异常过滤器
import {ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger} from "@nestjs/common";
import {Request, Response} from "express";
import {DatabaseError, ForeignKeyConstraintError, UniqueConstraintError, ValidationError,} from "sequelize";
import dayjs = require("dayjs");


//SequelizeDatabaseError
@Catch(UniqueConstraintError,ForeignKeyConstraintError,ValidationError,DatabaseError,)
export class AbnormalFilter implements ExceptionFilter{
    constructor() {
    }
    private readonly logger = new Logger(AbnormalFilter.name);
    async catch(exception:HttpException,host:ArgumentsHost){
        //将上下文切换为http
        let ctx = host.switchToHttp()

        //获取相应头
        let res = ctx.getResponse<Response>()
        //获取请求头
        let req = ctx.getRequest<Request>()
        // console.log(exception);

        //获取报错名称
        let errorName =exception.name
        const errorMessage = exception.message
        let {errorCode,message} = {errorCode:400044,message:"缺少数据或验证失败"}


        if(errorName == 'SequelizeForeignKeyConstraintError'){
            errorCode = 400042
            let startI = errorMessage.indexOf("FOREIGN KEY (`")
            let endI = errorMessage.indexOf("`) REFERENCES")
            const field = errorMessage.substring(startI+14,endI)
            switch (true) {
                case errorMessage.indexOf("add")!=-1:

                    message = `参数错误 ：${field}`
                    break;
                case errorMessage.indexOf("delete")!=-1:

                    message =`${field} 此字段与他进行绑定无法移除`
                    break;
                default:
                    message = "有信息与它关联无法删除或修改"
            }
        }else if(errorName == 'SequelizeUniqueConstraintError'){
            errorCode = 400043
            message = "参数存在，不能用重复参数"
        }else if(errorName == 'SequelizeDatabaseError'){
            if (exception.message.indexOf('cannot be null')!=-1){
                errorCode = 400044;
                message =`此参数不能为空：${errorMessage.substring(errorMessage.lastIndexOf('content：Column ')+7,errorMessage.indexOf("cannot be null"))}`
            }else{
                errorCode = 400046
                message = "出错了"+exception.message.slice(exception.message.indexOf('column'))
            }

        }else if(errorName == 'SequelizeValidationError'){

            //过滤
            switch (true) {
                case errorMessage.indexOf("Validation")!=-1:
                    let startC = " on "
                    let endC = " failed"
                    message = `参数验证不通过 ：${errorMessage.substring(errorMessage.indexOf(startC)+startC.length,errorMessage.indexOf(endC))}`
                    break;
                case errorMessage.indexOf("null")!=-1:

                    message =`此参数不能为空：${errorMessage.substring(errorMessage.indexOf('.')+1,errorMessage.indexOf(" cannot "))}`
                    break;
                default:
                    message = "缺少数据或验证失败"
            }
        }
        //页面

        res.status(400)
            .send({
            "data": null,
            "code": 400,
            errorCode,
            message,
            "timestamp": dayjs().valueOf(),
        })
        this.logger.error('ErrorUrl:'+req.url+'\ncontent：'+exception.message);


    }
}
