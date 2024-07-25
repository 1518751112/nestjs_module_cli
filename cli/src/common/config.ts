import {z} from "zod";
import {cosmiconfig} from "cosmiconfig";

const explorer = cosmiconfig("components", {
    searchPlaces: ["components.json"],
})
export const DEFAULT_STYLE = "default"
export const DEFAULT_COMPONENTS = "@/components"
export const DEFAULT_UTILS = "@/lib/utils"
export const DEFAULT_ROOT_DIR = "./src"

export const nestRawConfigSchema = z
    .object({
        rootDir: z.string(),
        tsconfig: z.string(),
        absoluteBaseUrl: z.string(),
        //已安装组件
        components: z.array(z.string()).optional(),
    })
    .strict()
export type NestRawConfigType = z.infer<typeof nestRawConfigSchema>

//通配符路径
export const nestConfigSchema = {
    "core": "/core/*",
    "common": "/common/*",
    "library": "/library/*",
    "modules": "/modules/*",
    "model": "/model/*"
}

export type DependenciesType = {
    [key:string]: string
}

export interface ModifyFilesImport {
    namedImports: string[];
    moduleSpecifier: string;
}

interface ModDecorator {
    name: string;
    arguments?: string[];
}

interface ModMethod {
    name: string;
    decorators?: ModDecorator[];
    code?: string;
}

interface ModifyFilesClass {
    className: string;
    decorators?: ModDecorator[];
    methods?: ModMethod[];
}
export interface ModifyFiles {
    //文件路径 [rootPath]/[path]
    path: string
    //修改内容
    imports?: ModifyFilesImport[];
    classes: ModifyFilesClass[];
}

export interface Component{
    dependencies?:DependenciesType
    devDependencies?:DependenciesType
    //默认安装目录
    installDir?:string
    //修改指定文件
    modifyFiles?:ModifyFiles[]
}

export async function getConfigInfo(cwd: string): Promise<any | null> {
    try {
        const configResult = await explorer.search(cwd)

        if (!configResult) {
            return null
        }
        configResult.filepath
        return configResult.config;
    } catch (error) {
        throw new Error(`Invalid configuration found in ${cwd}/components.json.`)
    }
}
