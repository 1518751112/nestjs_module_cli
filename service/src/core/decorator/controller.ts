import {PLATFORM} from '@common/enum'
import {AdminAuthGuard} from '@core/guards/admin.guard'
import {applyDecorators, Controller, UseGuards} from '@nestjs/common'
import {ClientAuthGuard} from '../guards/client.guard'

/**
 * 自动加入web/前缀路由的Controller注解守卫 UseGuards(WebAuthGuard)
 */
export function ClientController(prefix: string) {
  return applyDecorators(Controller(`${PLATFORM.client}/v1/${prefix}`), UseGuards(ClientAuthGuard))
}
export function AdminController(prefix: string) {
  return applyDecorators(Controller(`${PLATFORM.admin}/v1/${prefix}`), UseGuards(AdminAuthGuard))
}
