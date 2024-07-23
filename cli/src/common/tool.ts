import {registryIndexSchema} from "@/src/utils/registry/schema";
import fs from "fs";
import path from "path";
import {Component} from "@/src/common/config";

export async function getRegistry(cwd:string) {
    try {
        const rootDir = path.join(cwd, '../component');
        const dirList = await getDirList(rootDir);
        const list:Component[] = [];
        for (let i = 0; i < dirList.length; i++) {
            const src = path.join(rootDir, dirList[i]);
            //读取目录下的配置文件
            const filePath = path.join(src, 'config.json');
            let config = {};
            if (fs.existsSync(filePath)) {
                const result = fs.readFileSync(filePath, 'utf-8');
                config = JSON.parse(result);

            }
            list.push({
                name:dirList[i],
                config,
                path:src
            })
        }
        return list;
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
export async function installComponent(cwd:string,component:Component,isCover:boolean=false) {
    //获取组件的安装目录
    const targetPath = path.resolve(cwd,component.name);
    if(fs.existsSync(targetPath)){
        if(!isCover)
            throw new Error(`组件${component.name}已经存在`);
    }else{
        fs.mkdirSync(targetPath);
    }
    //获取目标目录的所有文件排除config.json
    const files = fs.readdirSync(component.path).filter((file)=>{
        return file!=='config.json';
    });
    //读取文件内容并写入目标目录
    files.forEach((file)=> {
        const content = fs.readFileSync(path.join(component.path, file), 'utf-8');
        fs.writeFileSync(path
            .join(targetPath, file), content);
    })
}
