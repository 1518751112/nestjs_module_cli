import { existsSync, promises as fs } from "fs"
import path from "path"
import {
    type Config,
} from "@/src/utils/get-config"
import { handleError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"
import {
    getRegistryBaseColors,
    getRegistryStyles,
} from "@/src/utils/registry"
import chalk from "chalk"
import { Command } from "commander"
import ora from "ora"
import prompts from "prompts"
import { z } from "zod"

import {DEFAULT_ROOT_DIR, nestConfigSchema, nestRawConfigSchema, NestRawConfigType} from "@/src/common/config";
import {loadConfig} from "tsconfig-paths";
import {getDirList, getRegistry} from "@/src/common/tool";

const PROJECT_DEPENDENCIES = [
    "tailwindcss-animate",
    "class-variance-authority",
    "clsx",
    "tailwind-merge",
]

const initOptionsSchema = z.object({
    cwd: z.string(),
    yes: z.boolean(),
    defaults: z.boolean(),
})

export const nestInit = new Command()
    .name("init")
    .description("初始化您的项目")
    .option("-y, --yes", "跳过确认提示。", false)
    .option("-d, --defaults,", "使用默认配置。", false)
    .option(
        "-c, --cwd <cwd>",
        "工作目录。默认为当前目录。",
        process.cwd()
    )
    .action(async (opts) => {
        try {
            const options = initOptionsSchema.parse(opts)
            const cwd = path.resolve(options.cwd)
            // Ensure target directory exists.
            if (!existsSync(cwd)) {
                logger.error(`路径 ${cwd} 不存在，请再试一次。`)
                process.exit(1)
            }

            const config = await promptForConfig(cwd, null, options.yes)
            await runInit(cwd, config)
            logger.info("")
            logger.info(
                `${chalk.green(
                    "完成!"
                )} 项目初始化完成。您现在可以添加组件。`
            )
            logger.info("")
        } catch (error) {
            handleError(error)
        }
    })

//获取控制台配置信息
export async function promptForConfig(
    cwd: string,
    defaultConfig: Config | null = null,
    skip = false
) {
    const highlight = (text: string) => chalk.cyan(text)

    const styles = await getRegistryStyles()
    const baseColors = await getRegistryBaseColors()

    const options = await prompts([
        {
            type: "text",
            name: "rootDir",
            message: `根目录文件夹是 ${highlight("./src")}?`,
            initial: DEFAULT_ROOT_DIR,
        },
        /*{
            type: "toggle",
            name: "typescript",
            message: `您想使用 ${highlight(
                "TypeScript"
            )} (推荐)?`,
            initial: defaultConfig?.tsx ?? true,
            active: "yes",
            inactive: "no",
        },
        {
            type: "select",
            name: "style",
            message: `您想使用哪种${highlight("风格")}?`,
            choices: styles.map((style) => ({
                title: style.label,
                value: style.name,
            })),
        },*/
    ])

    const tsConfig = await loadConfig(cwd);

    const config = nestRawConfigSchema.parse({
        rootDir: options.rootDir,
        tsconfig:"",
        absoluteBaseUrl:""
    })
    if(tsConfig.resultType=="success"){
        config.tsconfig = tsConfig.absoluteBaseUrl;
        config.absoluteBaseUrl = tsConfig.absoluteBaseUrl;
    }
    // Write to file.
    logger.info("")
    const spinner = ora(`Writing components.json...`).start()
    const targetPath = path.resolve(cwd, "components.json")
    await fs.writeFile(targetPath, JSON.stringify(config, null, 2), "utf8")
    spinner.succeed()
    return config
}


export async function runInit(cwd: string, config: NestRawConfigType) {
    const spinner = ora(`Initializing project...`)?.start()
    await initDir(cwd,config.rootDir);
    await updateTsConfig(cwd,config.rootDir);
    spinner?.succeed()
}

//初始化目录
async function initDir(cwd: string,rootDir:string){
    const list = Object.keys(nestConfigSchema);
    list.unshift("");
    console.log("");
    console.log("初始化目录-------");
    list.forEach(difName=>{
        const dir = path.resolve(cwd,rootDir,difName)
        if(!existsSync(dir)) {
            console.log(dir)
            fs.mkdir(dir)
        }
    })
}


//配置tsconfig.json的addMatchAll
export async function updateTsConfig(cwd: string,rootDir:string) {
    const tsConfigPath = path.resolve(cwd, "tsconfig.json")
    if (!existsSync(tsConfigPath)) {
        return
    }
    console.log("配置ts通配符路径-------");
    const tsConfig = await fs.readFile(tsConfigPath, "utf8")
    const parsed = JSON.parse(tsConfig)
    parsed.compilerOptions = parsed.compilerOptions || {}
    parsed.compilerOptions.paths = parsed.compilerOptions.paths || {}
    const simpleDir = path.resolve(cwd,rootDir).replace(`${cwd}\\`,"");
    Object.keys(nestConfigSchema).forEach((key:any)=>{
        // @ts-ignore
        const value = nestConfigSchema[key];
        parsed.compilerOptions.paths[`@${key}`] = [`${simpleDir}${value}`]
    })
    await fs.writeFile(tsConfigPath, JSON.stringify(parsed, null, 2), "utf8")
}
