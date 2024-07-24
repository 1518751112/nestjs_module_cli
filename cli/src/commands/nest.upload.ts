import {existsSync} from "fs"
import path from "path"
import {handleError} from "@/src/utils/handle-error"
import {logger} from "@/src/utils/logger"
import chalk from "chalk"
import {Command} from "commander"
import ora from "ora"
import {z} from "zod"
import {uploadComponentDir} from "@/src/common/tool";


const initOptionsSchema = z.object({
    cwd: z.string(),
    components: z.string(),
})

export const nestUpload = new Command()
    .name("upload")
    .description("自定义组件上传")
    .argument("components", "组件文件夹路径")
    .option(
        "-c, --cwd <cwd>",
        "工作目录。默认为当前目录。",
        process.cwd()
    )
    .action(async (components, opts) => {
        try {
            const options = initOptionsSchema.parse({components,...opts})
            const cwd = path.resolve(options.cwd)
            // Ensure target directory exists.
            if (!existsSync(cwd)) {
                logger.error(`路径 ${cwd} 不存在，请再试一次。`)
                process.exit(1)
            }

            //拼接组件包路径
            const componentPath = path.resolve(cwd,options.components);
            if(!existsSync(componentPath)){
                logger.error(`组件包路径 ${componentPath} 不存在，请再试一次。`)
                process.exit(1)
            }
            const spinner = ora(`组件上传中...`)?.start()

            const componentName = await uploadComponentDir(componentPath);
            spinner?.succeed(
                `组件已上传：${chalk.green(
                    `${componentName}!`
                )}。`
            )
            logger.info("")
        } catch (error) {
            handleError(error)
        }
    })
