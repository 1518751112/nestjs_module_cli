import {FindAndCountOptions} from 'sequelize';

export interface Conditions<T> {
  operator?: any;
  fuzzySearch?: boolean;
  attributes?: Array<keyof T>;
}

export interface PaginationResult<T = any> {
  data?: T[];
  current: number;
  pageSize: number;
  total: number;
  pageCount: number;

}

export interface FindPaginationOptions extends FindAndCountOptions {
  pagination?: {
    current: number;
    pageSize: number;
    order?: string;
  };
}
