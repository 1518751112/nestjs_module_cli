import {Injectable} from "@nestjs/common";
import {GitNotifyData} from "@modules/hooks/hook.dto";
import {GIT_CI_ORDER} from "@common/constant";
import {exec} from "child_process";
import * as configs from '@common/config'
import * as path from "path";

@Injectable()
export class HookTwoService {
    constructor(
    ) {
    }

    public async gitCi(body:GitNotifyData){
        const {gitCiAuthorize} = configs.info
        switch (body.object_kind){
            case "push":
                let isDeploy = false
                for (let i = 0; i < body.commits.length; i++) {
                    let temp = body.commits[i];
                    if (!gitCiAuthorize.includes(temp.author.email))
                        continue;

                    if (temp.message.indexOf(GIT_CI_ORDER[0])!=-1){
                        isDeploy = true;
                        break;
                    }
                }
                //更新服务
                if (isDeploy){
                    const address = path.join(__dirname,"../../../script");
                    exec(`cd ${address} && sh testDeploy.sh`,(error,stdout,stderr)=>{
                        // @ts-ignore
                        if (error=='null'||error==null)
                            console.log("更新服务成功")
                        else
                            console.log("更新服务失败",error,__dirname)
                    })
                }
                break;
        }
    }

}
