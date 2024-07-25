#!/usr/bin/env node
// import { init } from "@/src/commands/init"
// import { add } from "@/src/commands/add"
import {Command} from "commander"
import {getPackageInfo} from "./utils/get-package-info"
import {nestInit} from "@/src/commands/nest.init";
import {nestAdd} from "@/src/commands/nest.add";
import {nestUpload} from "@/src/commands/nest.upload";

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))
const main = async ()=>{
    const packageInfo = await getPackageInfo();
    const program = new Command();
     program
        .name("dep-tool")
        .description("将组件和依赖项添加到您的项目中")
        .version(
            packageInfo.version || "1.0.0",
            "-v, --version",
            "display the version number"
        )

    program.addCommand(nestInit).addCommand(nestAdd).addCommand(nestUpload)/*.addCommand(diff)*/
    program.parse()
    };

main();
