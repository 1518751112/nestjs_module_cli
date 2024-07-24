=== 服务端 nestjs 框架 ===


##项目部署
**运行环境**
- `系统` CentOS 、windows 、macOS
- `node` 14~16.18.0
- `npm` 8.5.5+
- `nestjs` 服务框架 8.0.0'
- `pm2` 服务管理工具 5.0.0+

**部署命令**
```shell
# 安装依赖
npm install || yarn install

#配置依赖文件
.env

#编译
npm run build

#启动

#调试模式 不需要编译
npm run dev

#正式模式1单线程启动 需要编译
npm run prod

#正式模式2负载均衡启动 需要编译 且需要配置pm2
pm2 start ./pm2.json

#查看项目运行日志
pm2 logs

#停止项目
pm2 stop all

#重启项目
pm2 restart all

#删除项目
pm2 delete all

```

## 常用命令

```
## 安装项目依赖模块
yarn install

## 安装 nestjs 开发脚手架
npm i -g @nestjs/cli
## 构建成 js 代码
npm run build

## 开发调试运行
npm run dev
## 正式编译并环境运行
npm run start

## 正式环境运行，跳过编译
npm run prod

## 在modules目录下创建module，controller，service
nest g module user modules
nest g controller user modules
nest g service user modules
```


## 项目配置

**项目中的常用环境**

- `dev` 开发、本地环境

- `test` 测试、调试环境

- `prod` 正式、线上环境


## 项目日志

**Logger 模块**

```shell
# src/library/logger/
```

**当服务在 dev 环境时，只在控制台输出日志。其他环境正常写入 logs 目录**

> 关于 winston 日志等级，👀 ：https://github.com/winstonjs/winston

```shell
# logs/
# logs/stdout.log # 常规日志，debug 等级以上都会输出到这里 
# logs/stderr.log # 错误和未捕捉的异常日志，只输出 error 等级 
```


---技术栈：nestjs + mysql + sequelize + jwt + cos + ts
## 目录结构
```shell
src 目录结构:
|-- common //公用模块
| |-- config //全局配置，尽量使用 dotenv 维护
| |-- dto //公用 dto
| |-- enum //常量
| |-- error //错误异常，逻辑中尽量使用 throw E.\* 来抛错
| |-- interface //ts 接口
| |-- type //ts 类型
|-- core //核心
| |-- decorator //装饰器，controller 可增加修改
| |-- guards //守卫，修改 jwt 认证
|-- library //公共库
| |-- tasks //可添加定时任务
| |-- ... // 其它
|-- model //数据表结构定义
|-- modules //主要业务实现 controller + service + dto
|-- services //公用 services
|-- main.js //启动函数，配置 app
```
---使用流程---

1. 配置文件
   拷贝 [config.example.yaml](config.example.yaml).env.example 到 [config.yaml](config.yaml)
   修改config.yaml 中 PORT、APP_NAME、HOME_PATH、DB_DATABASE 等参数和项目一致
   GIT_CI_AUTHORIZE 为 gitlab ci 的 邮箱，用于自动部署 |分割
   在提交代码时 添加，$更新服务$ 会自动触发 gitlab ci，自动部署到服务器
   需要将服务器的地址添加到 gitlab ci 的钩子中
2. 依赖安装与启动
   npm i
   npm run dev

3. 业务开发


详细说明见：https://www.yuque.com/stgame/ekqhbe/rtqms6
