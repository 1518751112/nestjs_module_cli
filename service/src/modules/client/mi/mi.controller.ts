import {OpenAuthorize} from '@core/decorator/authorize'
import {ClientController} from '@core/decorator/controller'
import {
  Body,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import {ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger'
import {DetComponentDetailDto, UploadComponentDto} from './mi.dto'
import {MiService} from './mi.service'
import {FileInterceptor} from '@nestjs/platform-express'
import {Express} from 'express'
import {FileService} from "@modules/file/file.service";
import {FileSizeValidationPipe} from "@core/pipe/fileSizeValidationPipe";

@ApiTags('我的')
@ClientController('mi')
export class MiController {
  constructor(
      private readonly service: MiService,
      private readonly fileService: FileService,
  ) {}

  @OpenAuthorize()
  @Post()
  create(@Body() createAdminDto) {
    // return this.service.create(createAdminDto)
  }

  @ApiOperation({ summary: '获取指定目录的结构' })
  @OpenAuthorize()
  @Get('dir')
  @ApiQuery({name: 'prefix', required: true, type: String})
  async testDirList(@Query() dto) {
    return this.fileService.getCosDirectoryStructure(dto.prefix,1)
  }

  @ApiOperation({ summary: '获取配置信息' })
  @OpenAuthorize()
  @Get('config')
  @HttpCode(HttpStatus.OK)
  async getConfig() {
    return this.service.getConfig()
  }

  @ApiOperation({ summary: '获取组件目录' })
  @OpenAuthorize()
  @Get('component')
  @HttpCode(HttpStatus.OK)
  async getComponentList() {
    return this.service.getComponentList()
  }

  @ApiOperation({ summary: '获取指定组件目录详情' })
  @OpenAuthorize()
  @Post('component/info')
  @HttpCode(HttpStatus.OK)
  async getComponentDetail(@Body() dto:DetComponentDetailDto) {
    return this.service.getComponentDetail(dto)
  }

  @ApiOperation({ summary: '获取组件目录' })
  @OpenAuthorize()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
      FileInterceptor('file')
  )
  @ApiBody({
    description: '文件上传',
    type: UploadComponentDto,
  })
  @HttpCode(HttpStatus.OK)
  @Post('upload/component')
  async uploadComponent(@UploadedFile(new FileSizeValidationPipe(1024*100)) file:Express.Multer.File,@Body() dto:UploadComponentDto) {
    if(!file)
      throw new HttpException(null,400014)
    if(!dto.fileName)
      throw new HttpException("文件名称不能为空",400)
    file.originalname = dto.fileName;
    return this.service.uploadComponent(file)
  }

/*  @ApiOperation({ summary: '文件上传示例' })
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
  }*/
}
