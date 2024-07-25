import {Injectable} from '@nestjs/common'
import {DeleteCosDirectoryDto, DetComponentDetailDto} from './mi.dto'
import {FileService} from "@modules/file/file.service";
import * as configs from "@common/config";
import {COS_CONFIG, info} from "@common/config";
import {Aide} from "@library/utils/aide";
import {join} from "path";

const libraryPath = `${info.appName}/component`;
let componentList:string[] = [];
@Injectable()
export class MiService {
    constructor(
        private readonly fileService: FileService,
    ) {
    }
    //获取组件包列表
    public async getComponentList() {
        const result = await this.fileService.getCosDirectoryStructure(libraryPath+"/",1);
        componentList = Object.keys(result).map(v=>v.replace(/\/$/,""));
        return {
            list:componentList,
            packageUrl:`https://${COS_CONFIG.domain}/${libraryPath}`
        };
    }

    //上传组件包
    public async uploadComponent(file: Express.Multer.File) {
        //检测文件名是否为二级目录
        const fileName = file.originalname;
        const pathName = join(fileName);
        if(pathName.indexOf("\\")==-1){
            Aide.throwException(400,'文件不能是在根目录')
        }
        const result = await this.fileService.uploadFile2(file,libraryPath);
        return result;
    }

    public async deleteCosDirectory(dto:DeleteCosDirectoryDto) {
        //验证邮箱权限
        if(configs.info.gitCiAuthorize.indexOf(dto.password)==-1) {
            Aide.throwException(400,"权限密码错误")
        }
        if(!componentList.length){
            const res = await this.getComponentList();
            componentList = res.list;
        }
        //判断组件名是否不对
        if(!componentList.includes(dto.name))Aide.throwException(400,'组件不存在：'+dto.name)
        return this.fileService.deleteCosDirectory(libraryPath+`/${dto.name}/`)
    }

    //获取组件目详情
    public async getComponentDetail(dto:DetComponentDetailDto) {
        if(!componentList.length){
            const res = await this.getComponentList();
            componentList = res.list;
        }
        //判断组件名是否不对
        const list = dto.names.filter(v=>!componentList.includes(v));
        if(list.length>0){
            Aide.throwException(400,'组件不存在：'+list.join(","));
        }
        const result:any = {};
        for (let i = 0; i < dto.names.length; i++) {
            const name = dto.names[i];
            result[name] = await this.fileService.getCosDirectoryStructure(libraryPath+"/"+name+"/");
        }
        return result
    }

    //配置信息
    public async getConfig() {
        return {
            packageUrl:`https://${COS_CONFIG.domain}/${libraryPath}`
        };
    }
}
