import {Module} from '@nestjs/common';
import {HookController} from './hook.controller';
import {HookService} from './hook.service';
import {HookTwoService} from "./hookTwo.service";

@Module({
  controllers: [
    HookController,
  ],
  providers:[HookService,HookTwoService]
})
export class HookModule {}
