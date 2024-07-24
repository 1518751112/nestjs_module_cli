import {Injectable, Logger} from '@nestjs/common'
import * as dayjs from "dayjs";
import {RequestCount} from "@common/interface";
import {ReqRecording} from "@common/cache";
import * as fs from "fs";
import {join} from "path";
import {Aide} from "@library/utils/aide";
import * as configs from "@common/config";
import {ReMailboxInfo} from "@common/config";

const ejs = require('ejs');

@Injectable()
export class TasksTwoMethod {
    constructor(
    ) {
    }

    private readonly logPath = join(__dirname, '../../reqLog')

    private readonly logger = new Logger(TasksTwoMethod.name)

    //整理接口请求数据
    public getApiData() {
        if (ReqRecording.length&&ReMailboxInfo.url) {
            const name = `${dayjs().format("YYYYMMDD_")+configs.info.env}.json`
            const filePath = join(this.logPath, name)
            //归类
            const infos: RequestCount[] = [];
            while (ReqRecording.length > 0) {
                //截取一个
                const v = ReqRecording.splice(0, 1)[0];
                let temp = infos.find(v1 => v1.path == v.path&&v1.type==v.type)
                if (!temp) {
                    temp = {
                        type: v.type,
                        path: v.path,
                        failCount: 0,
                        succeedCount: 0,
                        minTime: v.time,
                        maxTime: v.time,
                        avgTime: 0,
                    }
                    infos.push(temp)
                }

                if (v.state) {
                    temp.succeedCount++
                    temp.maxTime = Math.max(temp.maxTime, v.time)
                    temp.minTime = Math.min(temp.minTime, v.time)
                    temp.avgTime += v.time
                } else {
                    temp.failCount++
                }
            }
            //从缓存中获取历史数据
            let list: RequestCount[];
            try {
                const {data} = JSON.parse(fs.readFileSync(filePath, {encoding: "utf8"}))
                list = data
            } catch (e) {
                list = []
            }

            //合并
            infos.forEach(v => {
                const index = list.findIndex(v1 => v1.path == v.path&&v1.type==v.type)
                if (index == -1) {
                    list.push(v)
                } else {
                    list[index].failCount += v.failCount
                    list[index].succeedCount += v.succeedCount
                    list[index].minTime = Math.min(list[index].minTime, v.minTime)
                    list[index].maxTime = Math.max(list[index].maxTime, v.maxTime)
                    list[index].avgTime = Math.floor(((v.avgTime / v.succeedCount) + list[index].avgTime) / 2)
                }
            })
            if (!fs.existsSync(this.logPath)) {
                fs.mkdirSync(this.logPath);
            }
            // console.log("list",list)
            //写入文件
            fs.writeFileSync(filePath, JSON.stringify({data: list}), {encoding: "utf8"})
        }
    }

    //发送接口请求数据
    public async sendApiData() {
        const {gitCiAuthorize,env} = configs.info
        if (gitCiAuthorize.length == 0||!ReMailboxInfo.url) return
        const name = `${dayjs().format("YYYYMMDD_")+env}.json`
        const filePath = join(this.logPath, name)
        //从缓存中获取历史数据
        let list: RequestCount[];
        try {
            const {data} = JSON.parse(fs.readFileSync(filePath, {encoding: "utf8"}))
            list = data
        } catch (e) {
            list = []
        }
        if (list.length == 0) return
        //发送

        list.sort((a, b) => {
            if(b.maxTime == a.maxTime){
                return b.succeedCount - a.succeedCount
            }
            return b.maxTime - a.maxTime
        })
        list.forEach(v => {

            v.success = Math.floor(v.succeedCount / (v.succeedCount + v.failCount)*100)
        })

        //ejs渲染
        const data = await ejs.renderFile(join(__dirname, '../../../doc/mailModel.ejs'), {data:{
                list,title:ReMailboxInfo.title
            }})


        await Aide.sendMail(gitCiAuthorize.join(','), ReMailboxInfo.title, data)
    }

}
