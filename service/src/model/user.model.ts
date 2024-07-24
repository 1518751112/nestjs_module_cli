import {Column, DataType, Table} from 'sequelize-typescript'
import {BaseDate} from "@model/shared/baseDate";

@Table({ tableName: 'user', freezeTableName: true, timestamps: true })
export class User extends BaseDate<User> {

  @Column({
    comment: '手机号',
    type: DataType.STRING(11),
    unique:true,
    allowNull:false
  })
  declare phone: string

  @Column({
    comment: '密码',
    type: DataType.STRING(100),
    allowNull:false
  })
  declare password: string

  @Column({
    comment: '公司名称',
    type: DataType.STRING(100),
  })
  declare firmName: string

  @Column({
    comment: '密码验证code',
    type: DataType.STRING(50),
  })
  declare code: string

  @Column({
    comment: '最后登陆ip',
    type: DataType.STRING(20),
  })
  declare ip: string
}
