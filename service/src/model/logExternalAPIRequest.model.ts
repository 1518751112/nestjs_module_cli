import {Column, DataType, DefaultScope, Model, Table} from 'sequelize-typescript'

@DefaultScope(() => ({
  attributes: {
    exclude: ['createdAt', 'updatedAt'],
  },
}))
@Table({
  tableName: 'log_external_api_request',
  freezeTableName: true,
  timestamps: true,
})
export class LogExternalAPIRequest extends Model {
  @Column({
    comment: '请求地址',
    type: DataType.STRING(512),
  })
  declare url: string

  @Column({
    comment: '头信息JSON',
    type: DataType.JSON,
  })
  declare headers: object

  @Column({
    comment: '请求参数',
    type: DataType.JSON,
  })
  declare request: object

  @Column({
    comment: '响应内容',
    type: DataType.JSON,
  })
  declare response: object
}
