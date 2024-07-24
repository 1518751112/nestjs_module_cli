import {MYSQL_CONFIG} from '@common/config'
import {Module} from '@nestjs/common'
import {SequelizeModule, SequelizeModuleOptions} from '@nestjs/sequelize'

@Module({
  imports: [SequelizeModule.forRoot(MYSQL_CONFIG as SequelizeModuleOptions)],
})
export class MysqlModule {}
