import {Column, CreatedAt, UpdatedAt} from 'sequelize-typescript';
import {BaseModel} from './base.model';

export class BaseDate<T> extends BaseModel<T> {

  @CreatedAt
  @Column
  // @ts-ignore
  declare createdAt?: Date;

  @UpdatedAt
  @Column
  // @ts-ignore
  declare updatedAt?: Date;
}
