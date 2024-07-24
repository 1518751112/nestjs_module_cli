import {Column, DataType, Table} from 'sequelize-typescript'
import {BaseDate} from "@model/shared/baseDate";

@Table({ tableName: 'admin', freezeTableName: true, timestamps: true })
export class Admin extends BaseDate<Admin> {

  @Column({
    comment: '账号',
    type: DataType.STRING(20),
    unique:true,
    allowNull:false
  })
  declare account: string

  @Column({
    comment: '密码',
    type: DataType.STRING(100),
    allowNull:false
  })
  declare password: string

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
