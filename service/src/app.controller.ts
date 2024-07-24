import {Controller, Get} from '@nestjs/common'

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): object {
    return {
      version: '1.0.0',
      appName: process.env.APP_NAME,
      env: process.env.APP_ENV,
    }
  }
}
