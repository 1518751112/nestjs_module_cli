import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import * as configs from '@common/config'
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger'
import {ExceptionCatchFilter} from '@core/filter/exception'
import {DtoPipe} from '@core/pipe'
import {LoggerModule, LoggerProvider} from "./library/logger";
import {LogInterceptor} from '@core/interceptor/log'
import {join} from 'path'
import * as ClientModules from "./modules/client/index";
import {AbnormalFilter} from "./core/filter/abnormalFilter";
import {INestApplication} from '@nestjs/common'
import {SwaggerDocumentOptions} from "@nestjs/swagger/dist/interfaces";
import * as os from "os";
import express = require('express');
// 微信支付回调配置
// const bodyParser = require('body-parser')
// require('body-parser-xml')(bodyParser)

const getLocalIP = () => {
  const ips = []
  const interfaces = os.networkInterfaces();
  for (let devName in interfaces) {
    const iface = interfaces[devName];
    ips.push(iface[1].address)
  }
  return ips
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  const iocContext = app.select(AppModule)
  const logger = app.select(LoggerModule).get(LoggerProvider);
  app.useLogger(logger);
  // 微信支付回调配置
  // app.use(bodyParser.xml())

  // this.app.use(helmet());
  // 配置 public 文件夹为静态目录，以达到可直接访问下面文件的目的
  const rootDir = join(__dirname, "../..");
  app.use("/", express.static(join(rootDir, "public")));
  app.useGlobalInterceptors(
      iocContext.get(LogInterceptor),
  );
  //监听线程异常
  process.on('uncaughtException', function(err) {
    console.error('线程出现异常=>>', err);
    logger.error('线程出现异常=>>'+err.message);
  });
  process.on('unhandledRejection', function(reason, promise) {
    console.error('线程异常未处理=>>', reason);
    console.error('注:该异常系统容易崩溃');
    logger.error('线程异常未处理=>>'+reason['message']);
  });
  // 异常捕捉格式化
  app.useGlobalPipes(iocContext.get(DtoPipe))
  // 异常捕捉格式化
  app.useGlobalFilters(iocContext.get(ExceptionCatchFilter),iocContext.get(AbnormalFilter))

  // 创建接口文档
  if (configs.info.isDebug) {
    // ips = getLocalIP()
    // swaggerStart(app,{title:"管理端文档",path:"admin",modules:AdminModules,desc:""})
    swaggerStart(app,{title:"用户端文档",path:"client",modules:ClientModules,desc:""})
  }

  // 启动
  await app.listen(configs.info.port)
  console.log('[server start]', `http://127.0.0.1:${configs.info.port}/`)
}

//swagger文档 配置
function swaggerStart (app: INestApplication,options:SwaggerStartOptions){
  try {
    const config = new DocumentBuilder()
        .addBearerAuth()
        .setTitle(options.title)
        .setDescription(options.desc||"")
        .setVersion('1.0')
        .build()
    const documentOptions:SwaggerDocumentOptions = {}
    if (options.modules) {
      documentOptions.include =[...Object.values(options.modules) as Array<Function>]
    }
    const document = SwaggerModule.createDocument(app, config,documentOptions)
    SwaggerModule.setup(`doc/${options.path}`, app, document,{
      customCss: `.swagger-ui .model-box-control, .swagger-ui .models-control, .swagger-ui .opblock-summary-control {
        all: inherit;
        border-bottom: 0;
        cursor: pointer;
        flex: 1;
        padding: 0;
        user-select: text;
       }`,
    })
    setTimeout(()=>{
      console.log(`[${options.title}]`, `http://127.0.0.1:${configs.info.port}/doc/${options.path}`)
    },500)
  }catch (e) {
    console.log(e)
  }

}
interface SwaggerStartOptions{
  modules?:any
  desc?:string
  title:string
  path:string
}

bootstrap()

