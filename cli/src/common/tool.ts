import fs from "fs";
import path from "path";
import {Component} from "@/src/common/config";
import axios from "axios";
import {logger} from "@/src/utils/logger";
import FormData from "form-data";

export interface InstallComponentOptions {
    dirObj:any
    cwd:string
    name:string
    resourceUrl:string
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
    const {name,cwd,dirObj} = config;

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
export async function uploadComponentDir(dir:string) {
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
        await uploadComponent(filePath,`${componentName}/${fileName}`);
    }
    return componentName
}

//本地文件上传
export async function uploadComponent(filePath:string,fileName:string) {
    const formData = new FormData();
    //读取文件为 Blob
    const file = fs.readFileSync(filePath);
    formData.append('file', file,"name")
    formData.append('fileName', fileName.replace(/\\/g,'/'))
    try {
        const {data} = await serRequest.post("/mi/upload/component", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        return data;
    } catch (error: any) {
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
