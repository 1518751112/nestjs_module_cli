import {Injectable, Logger} from '@nestjs/common'
import {Cron, Interval} from '@nestjs/schedule'
import {TasksTwoMethod} from "./tasksTwo.method";
import {Aide} from "@library/utils/aide";

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksMethodTwo: TasksTwoMethod,
  ) {
  }
  private readonly logger = new Logger(TasksService.name)

  // @Cron('45 * * * * *')
  // handleCron() {
  //   this.logger.debug('Called when the second is 45')
  // }

  // @Interval(30000)
  // handleInterval() {
  //   this.logger.debug('Called every 30 seconds')
  // }

  // @Timeout(5000)
  // handleTimeout() {
  //   this.logger.debug('Called once after 5 seconds')
  // }
  @Cron('00 58 23 * * *')
  async handleCron6() {
    if (process.env.INSTANCE_ID == undefined || process.env.INSTANCE_ID == '0') {
      await this.tasksMethodTwo.sendApiData()
    }
  }
  @Cron('00 00 12 * * *')
  async handleCron3() {
    if (process.env.INSTANCE_ID == undefined || process.env.INSTANCE_ID == '0') {
      await this.tasksMethodTwo.sendApiData()
    }
  }

  @Interval(1000 * 15)
  async handleInterval2() {
    const num = process.env.INSTANCE_ID?Number(process.env.INSTANCE_ID)+1:1
    setTimeout(()=>{this.tasksMethodTwo.getApiData()},num*600)
    Aide.purgeBuffer()
  }
}
