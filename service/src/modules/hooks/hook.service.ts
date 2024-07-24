import {Injectable, Logger} from "@nestjs/common";

@Injectable()
export class HookService {
    constructor(
        // @Inject(RedisProvider.local)
        // private readonly redis: SuperRedis,

    ) {
    }

    private readonly logger = new Logger(HookService.name);



}
