import {Request} from 'express'
import {createParamDecorator, ExecutionContext, UnprocessableEntityException} from '@nestjs/common'
import {IPUtil} from '@library/utils/ip.util'
import {Pagination} from "../../common/interface";

/**
 * Gets the User property injected in the current Request object
 *
 * @use: @CurrentUser() or @CurrentUser('id')
 */
export const CurrentUser = createParamDecorator((key: any, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest()

  if (request['user']) {
    const user = request['user'] as any
    if (key && user[key]) return user[key]
    return user
  }

  return null
})

/**
 * Gets the User property injected in the current Request object
 *
 * @use: @CurrentUser() or @CurrentUser('id')
 */
export const CurrentAdmin = createParamDecorator((key: any, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest()

  if (request['admin']) {
    const admin = request['admin'] as any
    if (key && admin[key]) return admin[key]
    return admin
  }

  return null
})

/**
 * Get the IP information of the current client
 */
export const CurrentIP = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest()
  const ip = IPUtil.getIp(request)
  return ip
})

/**
 * Get the pagination information injected in the current request object
 */

export const CurrentPage = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
      const request: Request = ctx.switchToHttp().getRequest();
      const pagination: Pagination = { current: 1, pageSize: 10, order: null };

      if (request.query) {
        const { current, pageSize, order } = request.query;
        delete request.query.current
        delete request.query.pageSize
        delete request.query.order
        if (current) pagination.current = Number(current as string);
        if (order) pagination.order = order as string;
        if (pageSize) pagination.pageSize = Number(pageSize as string);
      }
      else if (request.query && request.query.pagination) {
        try {
          const { current, pageSize, order } = JSON.parse(request.query.pagination as string);
          if (current) pagination.current = current as number;
          if (order) pagination.order = order as string;
          if (pageSize) pagination.pageSize = pageSize as number;
        } catch (error) {
          throw new UnprocessableEntityException('pagination parse error');
        }
      }
      if (request.body){
        delete request.body.current
        delete request.body.pageSize
        delete request.body.order
      }

      return pagination;
    },
);
