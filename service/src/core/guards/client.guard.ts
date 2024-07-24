import {AUTHORIZE_KEY_METADATA} from '@core/decorator/authorize'
import {jwtDecode} from '@library/utils/crypt.util'
import {User} from '@model/index'
import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import {Aide} from "@library/utils/aide";
import {PLATFORM} from "@common/enum";

@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private reflector: Reflector = null) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // 检查无需登录
    const openAuthorize = this.reflector.get<boolean>(AUTHORIZE_KEY_METADATA, context.getHandler())
    if (openAuthorize) {
      return true
    }

    // jwt校验并绑定userID和user
    let payload = jwtDecode(request.headers['authorization'])
    if(!payload||!payload.id){
      Aide.throwException(400008)
    }
    if(payload.platform!=PLATFORM.client)Aide.throwException(400005)
    const user = await User.findOne({
      where:{
        id:payload.id
      },
      attributes:['id','code']
    })
    if(!user)Aide.throwException(400009)
    if(payload.code!=user.code)Aide.throwException(400010)
    request.user = user.toJSON()
    return true
  }
}
