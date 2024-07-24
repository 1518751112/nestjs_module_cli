import {ApiProperty} from '@nestjs/swagger'
import {Pagination} from './interface'

export class PaginationDto implements Pagination {
  @ApiProperty({
    name: 'current',
    required: false,
    description: '页码',
    type: Number,
  })
  current: number

  @ApiProperty({
    name: 'pageSize',
    required: false,
    description: '每页数量',
    type: Number,
  })
  pageSize: number
}
