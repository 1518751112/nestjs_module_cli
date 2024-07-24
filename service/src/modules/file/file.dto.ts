import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class FileDto {
  @IsNotEmpty({ message: "前缀不能为空" })
  @ApiProperty({
    name: "prefix",
    required: false,
    description: "前缀-文件类别标识",
  })
  prefix: string;
}

export class FileUploadDto {
  @ApiProperty({ type: "string", description: "上传的文件", format: "binary" })
  file: any;
}
