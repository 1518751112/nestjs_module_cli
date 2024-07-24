import {Module} from '@nestjs/common';
import {TasksService} from './tasks.service';
import {TasksTwoMethod} from "./tasksTwo.method";

@Module({
  providers: [TasksService,TasksTwoMethod],
})
export class TasksModule {}
