import {SetMetadata} from '@nestjs/common'
import {nanoid} from "nanoid";
import {info} from "@common/config";
import {Request} from "express";

export const API_LOCK_MECHANISMS = 'API_LOCK_MECHANISMS'
const identifier = info.appName+"_";
export const LockDefaultConfig:Omit<LockConfig, "key">={

}

/**
 * 指定api需要加锁
 */
export const OpenLock = (config?:LockConfig) => SetMetadata(API_LOCK_MECHANISMS, config?{key:identifier+nanoid(8),...LockDefaultConfig,...config}:{key:identifier+nanoid(8),...LockDefaultConfig})
export interface LockConfig {
    //标识api的唯一性
    key?: string;
    //是否需要匹配body参数或指定参数
    isBody?: boolean|((data:any)=>string);
    //是否需要匹配query参数或指定参数
    isQuery?: boolean|((data:any)=>string);
    //是否需要匹配守卫中的user参数或指定参数
    isUser?: boolean|((data:any)=>string);
    //是否需要匹配请求头指定参数
    req?: ((data:Request)=>string);
}
