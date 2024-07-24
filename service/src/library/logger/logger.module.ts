import {Module} from '@nestjs/common'

import {LoggerProvider} from './logger.service'

@Module({
  imports: [],
  providers: [LoggerProvider],
  exports: [LoggerProvider],
})
export class LoggerModule {}
