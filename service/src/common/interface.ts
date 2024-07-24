import {ENV} from '@common/type';

export interface ResponseBody<T> {
  data: T;
  code: number;
  errorCode: number;
  message: string;
  requestId: string;
  timestamp: number;
}

export interface HttpStatusConstantInfo {
  zh: string;
  en: string;
  code: number;
  errorCode: number;
}

export interface HttpStatusConstant {
  language?: "zh" | "en";
  status?: Map<number, HttpStatusConstantInfo>;
}

export interface Pagination {
  current: number
  pageSize: number
  order?: string
}

export interface ResponseBody<T> {
  data: T
  code: number
  errorCode: number
  message: string
  requestId: string
  timestamp: number
}

export interface AppException {
  error: number
  message: string
  statusCode?: number
}

export interface JwtPayload {
  username: string;
  sub: number;
  platform: string;
}

export interface Configs {
  env?: ENV;
  appName?: string;
  homePath?: string;
  port?: string | number;
  isDebug?: boolean;
  enableFileLoging?: boolean;
  enableConsoleLoging?: boolean;
  redis?: IoRedisOptions;
  database?: SequlizeOptions;
  gitCiAuthorize: string[];
  appKey?: string;
  pay_notify_url?: string;
  refund_notify_url?: string;
  wsNameSpace?: string;
}

export interface SequlizeOptions {
  username?: string;
  password?: string;
  database?: string;
  host?: string;
  port?: number;
  logging?: boolean;
  timezone?:string;
  dialect?: 'postgres' | 'mysql';
  pool?: { max: number };
  autoLoadModels?: boolean;
  synchronize?: boolean;
}

export interface IoRedisOptions {
  host?: string;
  port?: number;
  password?: string;
  expiredTime?: number;
}

export interface WeChat{
  appID:string;
  appSecret:string;
}

export interface BusinessInfo{
  app_id:string;
  mchId:string;
  partner_key:string;
  pfxName:string
}

export interface RequestCount {
  type: string;//请求类型
  path: string;//请求路径
  failCount: number;//失败次数
  succeedCount: number;//成功次数
  minTime: number;//最小耗时
  maxTime: number;//最大耗时
  avgTime: number;//平均耗时
  success?: number;//成功率
}

export interface RequestInfo {
  type: string;//请求类型
  path: string;//请求路径
  state: boolean;//状态
  time: number;//耗时
}

export interface ReMailbox {
  url: string;//发送地址
  title: string;//发送标题
}

export interface AliOssAccount{
  region:string;
  accessKeyId:string;
  accessKeySecret:string;
  bucket:string;
  timeout?:number;
  cname?:boolean;
  endpoint?:string;
}
export interface BufferCacheInfo {
  buffer: Buffer;//文件流
  name: string;//文件名+后缀
  time: number;//添加时间
}


/*
export interface SocketServer<T,E> {
  server?: Server;
  user:SocketUser<T,E>[];
  socketIDs:any // key[socketID]:value[platform]
}

export interface SocketUser<T,E> {
  id:number,
  platform:string,
  data?:T|E,
  socketIDs:string[]
  isAdmin?:boolean
}

export interface SocketVerifyRes {
  platform:string,
  res:Admin|User
}
*/
