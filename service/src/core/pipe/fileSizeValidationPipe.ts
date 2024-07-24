import {ArgumentMetadata, BadRequestException, Injectable, PipeTransform,} from "@nestjs/common";

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
    protected maxSize: number

    //文件大小限制 单位kb
    constructor(maxSize: number) {
        this.maxSize = maxSize

    }
    transform(value: any, metadata: ArgumentMetadata) {

        if (value.size < this.maxSize*1024) {
            return value;
        } else {
            throw new BadRequestException("上传文件超过指定大小");
        }
    }
}
