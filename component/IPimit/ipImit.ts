import { SetMetadata } from '@nestjs/common'
import {nanoid} from "nanoid";
import {info} from "@common/config";
import {Request} from "express";

export const API_IP_LIMIT = 'API_IP_LIMIT'
const identifier = info.appName+"_";
export const LimitDefaultConfig:Omit<LimitConfig, "key">={

}

/**
 * 指定api需要加锁
 */
export const OpenIPLimit = (config?:LimitConfig) => SetMetadata(API_IP_LIMIT, config?{key:identifier+nanoid(5),...LimitDefaultConfig,...config}:{key:identifier+nanoid(5),...LimitDefaultConfig})
export interface LimitConfig {
    //标识api的唯一性
    key?: string;
    // 时间间隔 单位秒 默认60
    interval?: number;
    // 时间内最大请求次数 默认10
    num?: number;
}
