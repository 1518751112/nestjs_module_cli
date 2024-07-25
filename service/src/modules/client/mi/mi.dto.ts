import {IsString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'
import {FileUploadDto} from "@modules/file/file.dto";

export class UserLoginDto {
  @ApiProperty({name: 'phone', required: true, description: '手机', type: String})
  phone: string

  @ApiProperty({
    name: 'password',
    required: false,
    description: '密码',
    type: String,
  })
  password: string
}

export class UploadComponentDto extends FileUploadDto{
  @ApiProperty({ type: "string", description: "文件名称" })
  fileName: string;
  @ApiProperty({ type: "string", description: "密码" })
  password: string;
}


export class DetComponentDetailDto{
  @ApiProperty({required: true, description: '组件名称', type: [String]})
  @IsString({message:"组件名称需要是字符串",each:true})
  names: string[];
}
