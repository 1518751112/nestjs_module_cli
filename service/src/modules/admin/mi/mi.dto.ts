import {ApiProperty} from '@nestjs/swagger'

export class AdminLoginDto {
  @ApiProperty({name: 'phone', required: true, description: '手机', type: String})
  phone: string

  @ApiProperty({
    name: 'password',
    required: false,
    description: '密码',
    type: String,
  })
  password: string
}
