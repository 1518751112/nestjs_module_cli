import {Module} from '@nestjs/common'
import * as index from "./index";

@Module({
  imports: [...Object.values(index)],
  providers: [],
  controllers: [],
})
export class PlatformClientModule {}
