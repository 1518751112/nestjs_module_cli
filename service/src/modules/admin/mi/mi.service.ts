import {Injectable} from '@nestjs/common'

@Injectable()
export class MiService {/*
  async create(createAdminDto: Admin) {
    /!*------------------ 条件判断 ------------------*!/
    /!*------------------ 业务执行（写入） ------------------*!/
    let { name, phone, password } = createAdminDto
    let vo = await Admin.create({
      name,
      phone,
      password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
    })
    /!*------------------ 返回结果（读取） ------------------*!/
    return await Admin.findByPk(vo.id)
  }

  async postToken(dto: LoginDto) {
    let admin: Admin = await Admin.findOne({ where: { phone: dto.phone }, attributes: ['password'] })
    /!*------------------ 条件判断 ------------------*!/
    if (!admin) {
      throw E.USER_NOT_EXISTS
    } else if (false == bcrypt.compareSync(dto.password, admin.password)) {
      throw E.INVALID_PASSWORD
    }

    /!*------------------ 业务执行（写入） ------------------*!/
    /!*------------------ 返回结果（读取） ------------------*!/
    admin = await Admin.findByPk(admin.id) //重新加载不返回password
    return {
      token: jwtEncodeInExpire({
        platform: PLATFORM.client,
        adminID: admin.id,
      }),
      admin,
    }
  }

  async updateToken(req: Request, admin: Admin) {
    let payload = jwtDecode(req.headers['authorization'])
    if (!payload || !payload.adminID) {
      return {
        token: null,
      }
    } else {
      let admin = await Admin.findByPk(payload.adminID)
      return {
        token: jwtEncodeInExpire({
          platform: PLATFORM.client,
          adminID: admin.id,
        }),
        admin,
      }
    }
  }*/
}
