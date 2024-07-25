import fs from "fs";
import path from "path";
import {Component, ModifyFiles} from "@/src/common/config";
import axios from "axios";
import {logger} from "@/src/utils/logger";
import FormData from "form-data";
import {execa} from "execa";
import {getPackageManager} from "@/src/utils/get-package-manager";
import {Project} from "ts-morph";

export interface InstallComponentOptions {
    dirObj:any
    cwd:string
    name:string
    resourceUrl:string
    dependencies:Map<string,string>
    devDependencies:Map<string,string>
}


//请求服务器数据
export const serRequest = axios.create({
    baseURL: 'http://127.0.0.1:10333/client/',
    timeout: 6000,
})
export async function getRegistry() {
    try {
        const {data} = await serRequest.get("/mi/component")
        return data as {
            list:string[],
            packageUrl:string
        };
    } catch (error) {
        throw new Error(`无法从注册表获取组件。`)
    }
}
//获取指定目录下的所有目录
export async function getDirList(root:string) {

    const dirList = fs.readdirSync(root);
    return dirList.filter((dir:string)=>{
        return fs.statSync(path.join(root,dir)).isDirectory();

    })
}

//安装组件
export async function installComponent(config:InstallComponentOptions,isCover:boolean=false) {
    const {name,cwd,dirObj,dependencies,devDependencies} = config;
    logger.info(name)
    //下载组件资源
    //循环出文件路径
    const list:string[] = [];
    const loop = (obj:any,pre:string)=>{
        for(let key in obj){
            if(obj[key]===null){
                list.push(pre+key)
            }else{
                loop(obj[key],pre+key)
            }
        }
    }
    //获取组件的安装目录
    let targetPath = path.resolve(cwd,name);
    //判断对象是否有指定属性
    const isConfig = Object.prototype.hasOwnProperty.call(dirObj,"config.json");
    delete dirObj["config.json"];
    let remotelyConfig:Component;
    //读取配置文件信息
    if(isConfig){
        const response = await axios({
            url: `${config.resourceUrl}/${name}/config.json`,
            method: 'GET',
            responseType: 'json',
        });
        remotelyConfig = response.data;
        if(remotelyConfig.installDir){
            targetPath = path.join(cwd,remotelyConfig.installDir,name);
            // console.log("targetPath",targetPath)
        }
    }

    if(fs.existsSync(targetPath)){
        if(!isCover)
            throw new Error(`组件${name}已经存在`);
    }else{
        fs.mkdirSync(targetPath);
    }
    loop(dirObj,"");
    for (let i = 0; i < list.length; i++) {
        const originalPath = list[i];
        const originalUrl = `${config.resourceUrl}/${name}/${originalPath}`;
        const target = path.join(targetPath,originalPath);
        // console.log("target",originalUrl,target)
        //下载文件使用流方式
        createDirectories(target,cwd);
        const writer = fs.createWriteStream(target);
        const response = await axios({
            url: originalUrl,
            method: 'GET',
            responseType: 'stream',
        });
        response.data.pipe(writer);
        //返回一个promise
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }

    // @ts-ignore
    if(remotelyConfig){
        if(remotelyConfig.dependencies){
            Object.keys(remotelyConfig.dependencies).forEach(key=>{
                // @ts-ignore
                dependencies.set(key,remotelyConfig.dependencies[key])
            })
        }
        if(remotelyConfig.devDependencies){
            Object.keys(remotelyConfig.devDependencies).forEach(key=>{
                // @ts-ignore
                devDependencies.set(key,remotelyConfig.devDependencies[key])
            })
        }
        //特殊配置修改ts文件
        if(remotelyConfig.modifyFiles){
            await modifyTsFile(cwd,remotelyConfig.modifyFiles);
        }

    }


}

//获取组件的目录详情
export async function getComponentInfo(names:string[]){
    try {
        const {data} = await serRequest.post("/mi/component/info",{names})
        return data;
    } catch (error:any) {
        throw new Error(error.message)
    }
}

export async function getServiceInfo(){
    try {
        const {data} = await serRequest.get("/mi/config")
        return data as {
            packageUrl:string
        };
    } catch (error:any) {
        throw new Error(error.message)
    }
}


/**
 * 根据给定路径遍历创建目录。
 * @param {string} filePath - 文件路径（包含目录和文件名）。
 * @param {string} rootPath - 根路径。
 */
function createDirectories(filePath:string,rootPath?:string) {
    if(rootPath){
        filePath = filePath.replace(rootPath,'')
    }
    // 取出目录路径
    const dirPath = path.dirname(filePath);
    // 分割路径，获得每一级目录
    const parts = dirPath.split(path.sep);

    // 初始化当前路径为根路径
    let currentPath = rootPath?rootPath:parts[0] === '' ? path.sep : parts[0];
    // 遍历每一级目录，逐级创建
    for (let i = 1; i < parts.length; i++) {
        currentPath = path.join(currentPath, parts[i]);

        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }
    }

}

//通过组件目录上传文件
export async function uploadComponentDir(dir:string,password:string) {
    // 分割路径，获得每一级目录
    const parts= dir.split(path.sep);
    const componentName = parts[parts.length-1];

    const list = browserFiles(dir,[]);
    // console.log("list",list,componentName)
    for (let i = 0; i < list.length; i++) {
        const filePath = list[i];
        const fileName = filePath.replace(dir,'');
        // console.log(filePath,`${componentName}${fileName}`)
        logger.info(fileName)
        await uploadComponent(filePath,`${componentName}/${fileName}`,password);
    }
    return componentName
}

//本地文件上传
export async function uploadComponent(filePath:string,fileName:string,password:string) {
    const formData = new FormData();
    //读取文件为 Blob
    const file = fs.readFileSync(filePath);
    formData.append('file', file,"name")
    formData.append('password', password)
    formData.append('fileName', fileName.replace(/\\/g,'/'))
    try {
        const {data} = await serRequest.post("/mi/upload/component", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data;
    } catch (error: any) {
        if(error.response?.data){
            throw new Error(error.response.data.message)
        }
        throw new Error(error.message)
    }
}

export function browserFiles(folder:string, list:string[]) {
    list = list || [];
    fs.readdirSync(folder).forEach(file => {
        let filePath = path.join(folder, file);
        let stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            browserFiles(filePath, list);
        }
        else if (file !== '.DS_Store' && file !== 'Thumbs.db') {
            list.push(filePath);
        }
    });
    return list;
}
//安装依赖
export async function installDependencies(cwd:string,config:{
    dependencies?:Map<string,string>,devDependencies?:Map<string,string>
}) {
    const {dependencies,devDependencies} = config
    if(dependencies){
        let str = "";
        dependencies.forEach((value,key)=>{
            str+=`${key}@${value.replace(/^\^/,"")} `
        })
        if(str){
            const packageManager = await getPackageManager(cwd)
            await execa(
                packageManager,
                [
                    packageManager === "npm" ? "install" : "add",
                    ...str.split(" ")
                ],
                {
                    cwd,
                }
            )
        }

    }
    if(devDependencies){
        let str = "";
        devDependencies.forEach((value,key)=>{
            str+=`${key}@${value.replace(/^\^/,"")} `
        })
        if(str){
            const packageManager = await getPackageManager(cwd)
            await execa(
                packageManager,
                [
                    packageManager === "npm" ? "install" : "add",
                    "-D",
                    ...str.split(" ")
                ],
                {
                    cwd,
                }
            )
        }
    }
}

//修改ts文件AST
export async function modifyTsFile(rootDir:string,serverDataList:ModifyFiles[]) {
    for (let i = 0; i < serverDataList.length; i++) {
        const serverData = serverDataList[i];
        // 初始化 ts-morph 项目
        const project = new Project();
        const sourceFile = project.addSourceFileAtPath(path.join(rootDir, serverData.path));

        // 添加或修改 import 语句
        serverData.imports?.forEach(importItem => {
            let importDeclaration = sourceFile.getImportDeclaration(importItem.moduleSpecifier);

            if (!importDeclaration) {
                // 如果 import 语句不存在，添加新的 import 语句
                sourceFile.addImportDeclaration({
                    namedImports: importItem.namedImports,
                    moduleSpecifier: importItem.moduleSpecifier,
                });
            } else {
                // 如果 import 语句存在，更新 named imports
                const currentNamedImports = importDeclaration.getNamedImports().map(n => n.getText());
                importItem.namedImports.forEach(namedImport => {
                    if (!currentNamedImports.includes(namedImport)) {
                        // @ts-ignore
                        importDeclaration.addNamedImport(namedImport);
                    }
                });
            }
        });

        serverData.classes?.forEach(cls => {
            // 查找目标类
            const classDeclaration = sourceFile.getClassOrThrow(cls.className);

            // 修改类的注解
            cls.decorators?.forEach(decorator => {
                const existingDecorator = classDeclaration.getDecorator(decorator.name);
                if (existingDecorator) {
                    // 修改现有注解参数
                    // @ts-ignore
                    existingDecorator.setArguments(decorator.arguments || []);
                } else {
                    // 添加新注解
                    classDeclaration.addDecorator({
                        name: decorator.name,
                        arguments: decorator.arguments || []
                    });
                }
            });

            // 修改类中的方法
            cls.methods?.forEach(method => {
                const methodDeclaration = classDeclaration.getMethodOrThrow(method.name);

                // 修改方法的注解
                method.decorators?.forEach(decorator => {
                    const existingDecorator = methodDeclaration.getDecorator(decorator.name);
                    if (existingDecorator) {
                        // 修改现有注解参数
                        // @ts-ignore
                        existingDecorator.setArguments(decorator.arguments || []);
                    } else {
                        // 添加新注解
                        methodDeclaration.addDecorator({
                            name: decorator.name,
                            arguments: decorator.arguments || []
                        });
                    }
                });

                // 修改方法体的代码
                if (method.code) {
                    methodDeclaration.setBodyText(method.code);
                }
            });
        });

        // 保存修改后的文件
        await sourceFile.save();
    }
}
