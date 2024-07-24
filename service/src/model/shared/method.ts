import {FindPaginationOptions, PaginationResult} from './interface';
import {OrderItem} from 'sequelize';

export async function findPagination<T = any>(
  options: FindPaginationOptions,
)
  : Promise<PaginationResult<T>>
{
  const { pagination } = options;
  const current = pagination && pagination.current ? Number(pagination.current) : 1;
  const order = pagination && pagination.order ? pagination.order : "id DESC";
  const pageSize = pagination && pagination.pageSize ? Number(pagination.pageSize) : 10;;

  options.limit = pageSize;
  options.offset = (current - 1) * pageSize;
  options.distinct = true;
  if (!options.order) {
    const orderArr = order.split(";")
    options.order = []
    for (let i = 0; i < orderArr.length; i++) {
      options.order.push(orderArr[i].split(" ") as OrderItem)
    }
  }

  const result = { data: [], current, pageSize, pageCount: 0, total: 0  };
  const data = await this.findAndCountAll(options);

  if (data) {
    result.data = data.rows;
    result.total = data.count;
    result.pageCount = Math.floor((data.count - 1) / pageSize) + 1;
  }
  return result;
}
