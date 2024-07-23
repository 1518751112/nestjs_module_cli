import { SetMetadata } from '@nestjs/common'
import {nanoid} from "nanoid";

export const CACHING_MECHANISMS = 'CACHING_MECHANISMS'
const identifier = "YY_";
export const CacheDefaultConfig:Omit<CacheConfig, "key">={
    //默认缓存时间为1分钟
    ttl: 60 * 1000,
}

/**
 * 开放授权Api，使用该注解则无需校验Token及权限
 */
export const OpenCache = (config?:CacheConfig) => SetMetadata(CACHING_MECHANISMS, config?{key:identifier+nanoid(8),...CacheDefaultConfig,...config}:{key:identifier+nanoid(8),...CacheDefaultConfig})
export interface CacheConfig {
    //标识api的唯一性
    key?: string;
    //缓存时间 单位毫秒
    ttl?: number;
    /*//到期时间
    expire?: number;*/
    //是否需要匹配body参数
    isBody?: boolean;
    //是否需要匹配query参数
    isQuery?: boolean;
}
