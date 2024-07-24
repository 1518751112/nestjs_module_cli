import {existsSync, promises as fs} from "fs"
import path from "path"
import {handleError} from "@/src/utils/handle-error"
import {logger} from "@/src/utils/logger"
import chalk from "chalk"
import {Command} from "commander"
import ora from "ora"
import prompts from "prompts"
import {z} from "zod"
import {getComponentInfo, getRegistry, installComponent} from "@/src/common/tool";
import {getConfigInfo, NestRawConfigType} from "@/src/common/config";

const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
})

export const nestAdd = new Command()
  .name("add")
  .description("将组件添加到您的项目中")
  .argument("[components...]", "要添加的组件")
  .option("-y, --yes", "跳过确认提示。", true)
  .option("-o, --overwrite", "覆盖现有文件。", false)
  .option(
    "-c, --cwd <cwd>",
    "工作目录。默认为当前目录。",
    process.cwd()
  )
  .option("-a, --all", "添加所有可用组件", false)
  .option("-p, --path <path>", "添加组件的路径。")
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components,
        ...opts,
      })

      const cwd = path.resolve(options.cwd)

      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`)
        process.exit(1)
      }

      const config = await getConfigInfo(cwd) as NestRawConfigType;
      if (!config) {
        logger.warn(
          `缺少配置文件请运行 ${chalk.green(
            `init`
          )} 创建一个 Components.json 文件。`
        )
        process.exit(1)
      }

      const {list:registry,packageUrl} = await getRegistry();

      let selectedComponents = options.all
        ? registry.map((entry) => entry)
        : options.components;

      if (!options.components?.length && !options.all) {
        const { components } = await prompts({
          type: "multiselect",
          name: "components",
          message: "您希望添加哪些组件?",
          hint: "空间可供选择。 A 切换全部。输入即可提交。",
          instructions: false,
          choices: registry.map((entry) => ({
            title: entry,
            value: entry,
            selected: options.all
              ? true
              : options.components?.includes(entry),
          })),
        })
        selectedComponents = components
      }

      if (!selectedComponents?.length) {
        logger.warn("未选择任何组件。退出。")
        process.exit(0)
      }
      //检测组件是否存在
      // @ts-ignore
      const addComponents = registry.filter(v=>selectedComponents.includes(v));
      if(addComponents.length!=selectedComponents.length){
        logger.error("组件选择错误：",selectedComponents.filter(v=>!addComponents.find(a=>a==v)))
        process.exit(0)
      }
      const spinner = ora(`组件安装中...`)?.start()
      const infos = await getComponentInfo(addComponents);
        //安装组件
        for (let i = 0; i < addComponents.length; i++) {
            const component = addComponents[i];
            // const pathTag = options.path?path.resolve(config.absoluteBaseUrl,options.path):path.resolve(config.absoluteBaseUrl,config.rootDir,"library")
            const pathTag = path.resolve(config.absoluteBaseUrl,config.rootDir)
            await installComponent({
              name:component,
                cwd:pathTag,
                dirObj:infos[component],
              resourceUrl:packageUrl
            },options.overwrite);
        }
      config.components = [...config.components||[],...selectedComponents];
        config.components = Array.from(new Set(config.components))
        //更新配置文件
        const targetPath = path.resolve(config.absoluteBaseUrl, "components.json")
        await fs.writeFile(targetPath, JSON.stringify(config, null, 2))
      spinner.succeed(`Done.`)
    } catch (error) {
      handleError(error)
    }
  })
