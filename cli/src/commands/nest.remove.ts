import {handleError} from "@/src/utils/handle-error"
import {logger} from "@/src/utils/logger"
import chalk from "chalk"
import {Command} from "commander"
import ora from "ora"
import {z} from "zod"
import {removeComponent} from "@/src/common/tool";


const initOptionsSchema = z.object({
    components: z.string(),
    password: z.string(),
})

export const nestLineRemove = new Command()
    .name("remove")
    .description("【组件管理】删除线上的组件")
    .argument("components", "组件名称")
    .option("-p, --password  <password>", "权限密码。")
    .action(async (components, opts) => {
        try {
            const options = initOptionsSchema.parse({components,...opts})

            if (!options.password) {
                logger.error(`缺少密码`)
                process.exit(1)
            }

            const spinner = ora(`组件删除中...`)?.start()

            await removeComponent(options.components,options.password);
            spinner?.succeed(
                `组件已删除：${chalk.green(
                    `${options.components}!`
                )}。`
            )
            logger.info("")
        } catch (error) {
            handleError(error)
        }
    })
