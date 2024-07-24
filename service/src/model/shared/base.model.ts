import {AutoIncrement, Column, Model, PrimaryKey} from 'sequelize-typescript';

import {findPagination} from './method';

export class BaseModel<T> extends Model<T> {
  @PrimaryKey
  @AutoIncrement
  @Column
  // @ts-ignore
  declare id?: number;

  // methods
  // ------------------------------------------------
  static findPagination = findPagination;
}
