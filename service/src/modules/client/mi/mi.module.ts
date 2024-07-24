import {Module} from '@nestjs/common'
import {MiService} from './mi.service'
import {MiController} from './mi.controller'
import {FileService} from "@modules/file/file.service";

@Module({
  controllers: [MiController],
  providers: [MiService,FileService],
})
export class MiModule {}
