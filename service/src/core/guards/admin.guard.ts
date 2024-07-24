import {AUTHORIZE_KEY_METADATA} from '@core/decorator/authorize'
import {jwtDecode} from '@library/utils/crypt.util'
import {Admin} from '@model/index'
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {Aide} from "@library/utils/aide";
import {PLATFORM} from "@common/enum";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private reflector: Reflector = null) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // 检查无需登录
    const openAuthorize = this.reflector.get<boolean>(AUTHORIZE_KEY_METADATA, context.getHandler())
    if (openAuthorize) {
      return true
    }

    // jwt校验并绑定adminID和Admin
    let payload = jwtDecode(request.headers['authorization'])
    if(!payload||!payload.id){
      Aide.throwException(400008)
    }
    if(payload.platform!=PLATFORM.admin)Aide.throwException(400005)
    const admin = await Admin.findOne({
      where:{
        id:payload.id
      },
      attributes:['id','code']
    })
    if(!admin)Aide.throwException(400009)
    if(payload.code!=admin.code)Aide.throwException(400010)
    request.user = admin.toJSON()
    return true
  }
}
