import {Module} from '@nestjs/common';

import {RedisProvider} from './redis.service';

@Module({
  imports: [],
  exports: RedisProvider.getProviders(),
  providers: RedisProvider.getProviders(),
})
export class RedisModule {}
