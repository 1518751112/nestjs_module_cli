import {Injectable,} from '@nestjs/common'
import {COS_CONFIG} from "@common/config";
import * as COS from 'cos-nodejs-sdk-v5';
import {_nanoid, Aide} from "@library/utils/aide";

@Injectable()
export class FileService {
  constructor() {}
  private cos: COS = null;

  public getCos() {
    if (!this.cos) {
      this.cos = new COS({
        SecretId: COS_CONFIG.SecretId,
        SecretKey: COS_CONFIG.SecretKey, // 密钥key
      });
    }
    return this.cos;
  }

  public async uploadFile(file: Express.Multer.File) {
    const cos = this.getCos();
    const fileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const suffix = fileName.substring(
        file.originalname.lastIndexOf('.'),
    );
    const putObjectResult = await new Promise((resolve, reject) => {
      cos.putObject(
          {
            Bucket: COS_CONFIG.Bucket,
            Region: COS_CONFIG.Region,
            Key: `/${COS_CONFIG.dir}/${_nanoid(3)}/${fileName.replace(suffix, '')}${suffix}`,
            Body: file.buffer,
          },
          function (err, data) {
            if (err) {
              reject(err);
              return;
            }
            resolve(data);
          },
      );
    });
    let result = `https://${putObjectResult['Location']}`
    if (COS_CONFIG.domain) {
      result = result.replace(
          /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/,
          COS_CONFIG.domain,
      );
    }

    return decodeURI(result);
  }

  public async uploadFile2(file: Express.Multer.File,dir:string) {
    const cos = this.getCos();
    const putObjectResult = await new Promise((resolve, reject) => {
      cos.putObject(
          {
            Bucket: COS_CONFIG.Bucket,
            Region: COS_CONFIG.Region,
            Key: `/${dir}/${file.originalname}`,
            Body: file.buffer,
          },
          function (err, data) {
            if (err) {
              reject(err);
              return;
            }
            resolve(data);
          },
      );
    });
    let result = `https://${putObjectResult['Location']}`
    if (COS_CONFIG.domain) {
      result = result.replace(
          /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/,
          COS_CONFIG.domain,
      );
    }

    return decodeURI(result);
  }

  //获取指定目录下的目录结构
  async getCosDirectoryStructure( Prefix = '',depth:number=0) {
    let result = {};
    let pendingPrefixes = [{ prefix: Prefix, parent: result }];
    const maxConcurrentRequests = 2; // 最大并发请求数
    let num = 0;
    const listObjects =  async (Prefix:string,parent)=> {
      const params = {
        Bucket:COS_CONFIG.Bucket,
        Region:COS_CONFIG.Region,
        Prefix,
        Delimiter: '/',
      };

      const data = await this.getCos().getBucket(params);

      // 添加子目录
      for (const prefix of data.CommonPrefixes) {
        const dirName = prefix.Prefix.slice(Prefix.length);
        parent[dirName] = {};
        pendingPrefixes.push({ prefix: prefix.Prefix, parent: parent[dirName] });
      }

      // 添加文件
      for (const content of data.Contents) {
        if (content.Key !== Prefix) {
          const fileName = content.Key.slice(Prefix.length);
          parent[fileName] = null;
        }
      }
    }

    async function processPrefixes() {
      while (pendingPrefixes.length > 0) {
        const currentBatch = pendingPrefixes.splice(0, maxConcurrentRequests);
        num+=currentBatch.length;
        if(depth>0&&num>depth){
          // Aide.throwException(400,'目录层级超过限制')
          break;
        }
        await Promise.all(currentBatch.map(({ prefix, parent }) => listObjects(prefix, parent)));
      }
    }

    await processPrefixes();

    return result;
  }

  //删除指定文件夹
    public async deleteCosDirectory(Prefix:string) {
        //不能是根目录
        if(Prefix=="/"||Prefix==""||Prefix=="\\"){
            Aide.throwException(400,'不能删除根目录')
        }
        Prefix = Prefix[Prefix.length-1]!="/"?Prefix+"/":Prefix;
        const dirObj = await this.getCosDirectoryStructure(Prefix);
        const keys = Object.keys(dirObj);
        if(!keys.length){
            Aide.throwException(400,'目录不为空')
        }
        //循环出文件路径
        const list:string[] = [];
        const loop = (obj:object,pre:string)=>{
            for(let key in obj){
                if(obj[key]===null){
                    list.push(pre+key)
                }else{
                    loop(obj[key],pre+key)
                }
            }
        }
        loop(dirObj,Prefix);
        const num = list.length;
        while (list.length > 0) {
        const dataList = list.splice(0, 1000);
            //删除文件
            await this.getCos().deleteMultipleObject({
                Bucket: COS_CONFIG.Bucket,
                Region: COS_CONFIG.Region,
                Objects: dataList.map(v=>({
                    Key: v
                }))
            });
        }

        return num;
    }
}
