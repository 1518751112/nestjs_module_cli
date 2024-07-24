import {OpenAuthorize} from '@core/decorator/authorize'
import {Admin} from '@model/admin.model'
import {AdminController} from '@core/decorator/controller'
import {
    Body,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Req,
    Request,
    UploadedFile,
    UseInterceptors
} from '@nestjs/common'
import {ApiBody, ApiConsumes, ApiOperation, ApiTags} from '@nestjs/swagger'
import {AdminLoginDto} from './mi.dto'
import {MiService} from './mi.service'
import {CurrentAdmin} from '@core/decorator/request'
import {FileInterceptor} from '@nestjs/platform-express'
import {FileUploadDto} from "../../file/file.dto";
import {CensorParamPipe} from "@core/pipe/censorParam.pipe";
import {Express} from 'express'
import {FileService} from "@modules/file/file.service";
import {FileSizeValidationPipe} from "@core/pipe/fileSizeValidationPipe";

@ApiTags('我的')
@AdminController('mi')
export class MiController {
  constructor(
      private readonly service: MiService,
      private readonly fileService: FileService,
  ) {}

  @OpenAuthorize()
  @Post()
  create(@Body() createAdminDto: Admin) {
    // return this.service.create(createAdminDto)
  }

  @ApiOperation({ summary: '登录' })
  @OpenAuthorize()
  @Post('login')
  async postToken(@Body(new CensorParamPipe) dto: AdminLoginDto) {
    // return await this.service.postToken(dto)
  }

  @ApiOperation({ summary: '自动登录' })
  @OpenAuthorize()
  @Post('autoLogin')
  async postAutoToken(@Request() req, @CurrentAdmin() admin: any) {

  }

  @ApiOperation({ summary: '文件上传示例' })
  @OpenAuthorize()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
      FileInterceptor('file')
  )
  @ApiBody({
    description: '文件上传',
    type: FileUploadDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('upload')
  async upload(@UploadedFile(new FileSizeValidationPipe(1024*100)) file:Express.Multer.File,@Req() req) {
    if(!file)
      throw new HttpException(null,400014)
    file.originalname = req.headers['filename']||file.originalname
    const result = await this.fileService.uploadFile(file)
    return result
  }
}
