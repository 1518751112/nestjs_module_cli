import * as JSZip from "jszip";
import * as fs from "fs";
import axios from "axios";
import {Column} from "exceljs";
import {join} from "path";
import {HttpException} from "@nestjs/common";
import {customAlphabet} from "nanoid";
import {ReMailboxInfo} from "@common/config";
import {Op} from "sequelize";
import {FileBuffer} from "@common/cache";
import {BufferCacheInfo} from "@common/interface";
import Excel = require("exceljs");
import dayjs = require("dayjs");
import url = require("url");

const crypto = require('crypto');

export class Aide {

    private static cacheFilePath = join(__dirname,'../../cache.json');


    /**
     * 打包文件
     * @param fileName 包名称
     * @param filePath 文件路径
     */
    public static async packageFile(fileName: string, filePath: string[]): Promise<any> {
        fileName += '.zip'
        const zip = new JSZip()

        const aa = ['http:', 'https:']

        for (const v of filePath) {
            let name = v.split('\/')
            if (name.length == 1)
                name = v.split('\\')

            let p = url.parse(v).path.replace('/xy1','')
            //GBK解码
            // p = unescape(path.join(__dirname,'../../../public',p))


            let file;
            try {
                // file = fs.readFileSync(p);
                const {data} = await axios.get(encodeURI(v),{timeout:1500,responseType:'arraybuffer'})
                file = Buffer.from(data, "binary");
            }catch (e) {
                console.log(e.data||e)
                continue
            }


            zip.file(name[name.length - 1], file);
        }

        let buffer:any = await zip.generateAsync({
            // 压缩类型选择nodebuffer，在回调函数中会返回zip压缩包的Buffer的值，再利用fs保存至本地
            type: "nodebuffer",
            // 压缩算法
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        })
        //写入磁盘
        let buf = Buffer.from(buffer, "binary");
        return buf

    }

    /**
     * JSON转Excel
     * @param columns
     * @param rows
     * @param sheetName
     *
     * @example
     * 使用buff示例: 直接返回文件不使用链接 请求方法为get
     * res.set({
                            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
                        })
     return new StreamableFile(buffer as any)
     */
    public static async jsonToExcel(
        columns: Array<Partial<Column>>,
        rows: any[],
        sheetName = dayjs().format("YYYY-MM-DD 资料"),
    ) {
        const workbook = new Excel.Workbook();
        workbook.creator = "nestjs";
        workbook.lastModifiedBy = "nestjs";
        workbook.created = new Date();
        workbook.modified = new Date();
        let sheet = workbook.addWorksheet(sheetName);
        sheet.columns = columns;
        sheet.addRows(rows);
        sheet.getRow(1).font ={
            bold: true,
            name: '微软雅黑',
        }
        const fileName = sheetName + ".xlsx";

        //写入缓冲区
        let buffer:any = await workbook.xlsx.writeBuffer()
        let buf = Buffer.from(buffer, "binary");
        return {
            fileName,
            buffer: buf
        };
    }

    // Excel转JSON
    public static async excelToJson(buffer:Buffer,jsExclKeys:JsExclKey[]) {
        const result:CellL = {row:[],col:[]}
        const workbook = new Excel.Workbook();
        const file = await workbook.xlsx.load(buffer)
        const worksheet = await file.getWorksheet(1)//默认获取一个表

        const newJsExclKeys:JsExclKey[] = []
        //初始化
        for (let i = 0; i < jsExclKeys.length; i++) {
            let jsExclKey = newJsExclKeys.find(v=>v.keyName==jsExclKeys[i].keyName||v.key==jsExclKeys[i].key)
            //跳过重复键名
            if (jsExclKey)
                continue;
            newJsExclKeys.push({
                keyName:jsExclKeys[i].keyName,
                key:jsExclKeys[i].key,
                index:-1,
            })
        }
        worksheet.eachRow((row,ie)=>{
            if (ie!=1){
                const obj = {}
                for (let i=0 ;i<row.values.length;i++) {
                    let jsExclKey = newJsExclKeys.find(val=>val.index==i)

                    if (jsExclKey&&jsExclKey.index==i){
                        let value = (row.values[i+1]||row.values[i+1]==0)? row.values[i+1]:null
                        //过滤可能为对象
                        if (value!=null&&(typeof value)=="object"){
                            if (value["richText"]){
                                let str = ''
                                value["richText"].forEach(valuee=>{
                                    str+=valuee.text
                                })
                                value = str
                            }else if (value["text"]){// 邮箱转链接
                                value=value["text"]
                            }else if(value["hyperlink"]){
                                value=null;
                            }else if(value["result"]){
                                value=value["result"];
                            }

                        }
                        //排除：/ \
                        if (value&&(value=="/"||value=="\\"))
                            value = null
                        obj[jsExclKey.key] = value
                        let col:Col =result.col.find(va=>va.key==jsExclKey.key)
                        if (!col){
                            result.col.push({
                                key:jsExclKey.key,
                                values:[value]
                            })
                        }else{
                            //添加列内容
                            col.values.push(value)
                        }
                    }
                }
                //添加行内容
                result.row.push(obj)
                // result.push(obj)
            }else{
                //第一行为主键,检测主键
                for (let i=0 ;i<row.values.length;i++) {
                    let jsExclKey = newJsExclKeys.find(v=>v.keyName==row.values[i+1])
                    if (jsExclKey){
                        jsExclKey.index=i
                    }
                }
            }
        })
        return result

    }

    //字段模糊搜索化
    public static Fuzzification(obj:any,filterKey?:string[]){
        const attributes  = Object.keys(obj)
        // const where = {}
        for (let i in attributes) {
            let value = obj[attributes[i]]
            let key = attributes[i]

            if(typeof value == 'object'||typeof value == 'number'|| key.search(/(ID)$/i)!=-1||(filterKey&&filterKey.includes(key))){
                // obj[key] = value
                continue;
            }
            else{
                obj[key] = {
                    [Op.like]:`%${value.trim()}%`
                }
            }

        }
        return obj
    }

    //部分字段聚合搜索
    public static polymerization(dto:any,config:PolymerizationConfig){
        if(!dto[config.publicKey])
            return
        const or:any[] = []

        for (let i = 0; i < config.key.length; i++) {
            or.push({
                [config.key[i]]:{
                    [Op.like]:`%${dto[config.publicKey]}%`
                }
            })
        }
        dto[Op.or] = or
        delete dto[config.publicKey]
        return dto;
        /*dto[Op.or] = [
            {
                title:{
                    [Op.like]:`%${dto.title}%`
                }
            },
            {
                content:{
                    [Op.like]:`%${dto.title}%`
                }
            }
        ]*/
    }

    /**
     * 获取html内的字符串
     * @param data
     */
    public static getHTMLString(data:any[]){
        let str = ''
        if (data.length==1&& typeof data[0] == "string"){
            return data[0]
        }
        for (let i = 0; i < data.length; i++) {
            if (!data[i].content)
                continue;
            if (typeof data[i].content[0] == "object"){
                str+=this.getHTMLString(data[i].content)
            }else{
                str+= data[i].content[0]
            }
        }
        return str.replace(/&nbsp;/g,'')
    }

    /**
     * 字符串转JSON
     * @param value 需要转换的值
     */
    public static parse(value:string){
        try {
            return JSON.parse(value)
        }catch (e){
            return value
        }
    }

    //从缓存文件中获取数据
    public static getCacheData(key?:string|number){
        try {
            const data = JSON.parse(fs.readFileSync(this.cacheFilePath,{encoding:"utf8"}))
            if(key){
                let result = data[key]
                if(result){
                    //判断是否过期 0为永久
                    if (result.aging==0){
                        return result.data
                    }else if (result.aging&&result.createAt>=(Date.now()-result.aging*60*1000)){
                        return result.data
                    }else if(result.validityPeriod&&result.validityPeriod>result.createAt){
                        return result.data
                    }else{
                        return null
                    }
                }else{
                    return null
                }
            }
            return data
        }catch (e) {
            return key?null:{}
        }


    }

    //将数据写入缓存文件
    public static setCacheData(key:string|number,value:any,config?:FileConfig){
        const data = this.getCacheData()
        data[key] = {
            data:value,
            createAt:Date.now(),
            aging:config?config.aging:0,
            validityPeriod:config?config.validityPeriod:null
        }
        const filePath = join(this.cacheFilePath,'../')
        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath);
        }
        fs.writeFileSync(this.cacheFilePath,JSON.stringify(data),{encoding:"utf8"})
    }

    //抛出异常
    public static throwException(status:number,message?:string){
        throw new HttpException(message||null, status)
    }

    public static getDistance(lat1:number, lng1:number, lat2:number, lng2:number) { // lat1,lng1为用户当前位置，lat2,lng2为商家位置
        let radLat1 = (lat1 * Math.PI) / 180.0;
        let radLat2 = (lat2 * Math.PI) / 180.0;
        let a = radLat1 - radLat2;
        let b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
        let s = 2 * Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) *
                Math.cos(radLat2) *
                Math.pow(Math.sin(b / 2), 2)
            )
        );
        s = s * 6378.137; // EARTH_RADIUS;
        s = Math.round(s * 1000)
        return s;
    }

    /**
     * 发送邮件
     * @param mail 收件邮箱
     * @param title 标题
     * @param data 内容
     * */
    public static async sendMail(mail:string,title:string,data:string) {
        try {
            const result = await axios.post(ReMailboxInfo.url, {
                mail, title, data
            })
            return result.data
        }catch (e) {
            throw e.message
        }
    }

    /**
     * 添加文件流临时文件
     * @param buffer 文件流
     * @param fileName 文件名
     */
    public static addBuffer(buffer: Buffer, fileName: string):string {
        const hash = crypto.createHash('md5');
        const md5 = hash.update(buffer).digest('hex');
        FileBuffer.set(md5, {
            buffer,
            name: fileName,
            time: Date.now()
        })

        return md5
    }

    /**
     * 获取文件流临时文件
     * @param md5 文件md5
     */
    public static getBuffer(md5: string):BufferCacheInfo {
        const result = FileBuffer.get(md5)
        if (!result) Aide.throwException(400, '文件不存在')
        return result
    }

    /**
     * 清理文件流临时文件
     */
    public static purgeBuffer() {
        const now = Date.now()
        //有效期
        const limit = 1000 * 60
        FileBuffer.forEach((value, key) => {
            if (now - value.time > limit) {
                FileBuffer.delete(key)
            }
        })
    }

}

export const _nanoid = customAlphabet('1234567890')
export const $nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')

interface PolymerizationConfig {
    key:string[],
    publicKey:string
}

export interface JsExclKey{
    keyName:string;
    key:string;
    index?:number
}

export interface CellL{
    col:Col[];
    row:any[];
}

export interface Col{
    key:string;
    values:any[]
}

export class FileConfig{
    aging?:number; //指定文件的过期时间，单位为分钟。默认为 0，表示永不过期。
    validityPeriod?:number; //指定时间内有效
}
