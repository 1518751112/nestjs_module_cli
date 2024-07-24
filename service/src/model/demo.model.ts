import {ApiProperty} from '@nestjs/swagger'
import {Column, DataType, Table} from 'sequelize-typescript'
import {BaseModel} from './shared/base.model'

@Table({ tableName: 'demo', freezeTableName: false, timestamps: true })
export class Demo extends BaseModel<Demo> {
  @ApiProperty({ name: 'disabled', type: Boolean, description: '不可用', required: false })
  @Column({ comment: '不可用', type: DataType.BOOLEAN })
  declare disabled: boolean

  @ApiProperty({ name: 'href', type: String, description: '链接', required: false })
  @Column({ comment: '链接', type: DataType.STRING(256) })
  declare href: string

  @ApiProperty({ name: 'avatar', type: String, description: '头像', required: false })
  @Column({ comment: '头像', type: DataType.STRING(256) })
  declare avatar: string

  @ApiProperty({ name: 'name', type: String, description: '名称', required: true })
  @Column({ comment: '名称', type: DataType.STRING(64) })
  declare name: string

  @ApiProperty({ name: 'owner', type: String, description: '所有者', required: false })
  @Column({ comment: '所有者', type: DataType.STRING(64) })
  declare owner: string

  @ApiProperty({ name: 'desc', type: String, description: '描述', required: true })
  @Column({ comment: '描述', type: DataType.STRING(256) })
  declare desc: string

  @ApiProperty({ name: 'callNo', type: Number, description: '呼叫号码', required: false })
  @Column({ comment: '呼叫号码', type: DataType.INTEGER })
  declare callNo: number

  @ApiProperty({ name: 'status', type: Number, description: '状态', required: false })
  @Column({ comment: '状态', type: DataType.INTEGER })
  declare status: number

  @ApiProperty({ name: 'progress', type: Number, description: '进度', required: false })
  @Column({ comment: '进度', type: DataType.INTEGER })
  declare progress: number
}
