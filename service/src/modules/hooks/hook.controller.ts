import {ApiOperation} from "@nestjs/swagger";
import {Body, Controller, HttpCode, HttpStatus, Param, Post, Query, Req} from "@nestjs/common";
import {GitNotifyData} from "./hook.dto";
import {OpenAuthorize} from "@core/decorator/authorize";
// import * as request from 'request-promise'
import {HookService} from "./hook.service";
import {HookTwoService} from "./hookTwo.service";

// @ApiTags("调试222")
@Controller("hook")
export class HookController {
    constructor(
        // @Inject(RedisProvider.local)
        // private readonly redis: SuperRedis,
        private readonly service:HookService,
        private readonly serviceTwo:HookTwoService,

    ) {
    }



    @OpenAuthorize()
    @Post("git/cli")
    @ApiOperation({summary: "git自动部署"})
    @HttpCode(HttpStatus.OK)
    async gitCi(
        @Param() params,
        @Req() req,
        @Body() body:GitNotifyData,
        @Query() query
    ) {

        await this.serviceTwo.gitCi(body)
        return true
    }
}
