import * as jwt from 'jsonwebtoken'
import * as configs from '@common/config'
import {AESModeType, AESPadType, EncodeType, HashType} from "@common/type";
import * as CryptoJS from 'crypto-js';

const JSSM4 = require("jssm4");

export function jwtDecode(token: string) {
  if (token) {
    token = token.substr(0, 7) == 'Bearer ' ? token.substr(7) : token
    const secret = configs.info.env+configs.info.appKey
    try {
      let payload = jwt.verify(token, secret)
      delete payload.exp
      delete payload.iat
      return payload
    } catch (err) {
      console.error('[JWT failed]', err)
      return null
    }
  } else {
    return null
  }
}

/**
 * token加密
 * @param payload 加密数据
 * @param second 过期时间 秒
 */
export function jwtEncodeInExpire(payload: object, second: number = 5 * 24 * 60 * 60) {
  return jwt.sign(payload, configs.info.env+configs.info.appKey, { expiresIn: second })
}

/**
 * @see: [cryptojs](https://cryptojs.gitbook.io/docs/)
 */
export class CryptoUtil {
  static sm4;
  /**
   * hashing
   *
   * Hash encoding algorithms
   */
  static hashing(str: string, type: HashType = 'MD5'): string {
    if (!str || !type) return '';

    return CryptoJS[type](str).toString();
  }

  //sm4加密
  static sm4Encryption(str: string): string {
    if(!this.sm4) this.sm4=new JSSM4(configs.info.appKey);
    return this.sm4.encryptData_ECB(str)
  }
  //sm4解密
  static sm4Decrypt(str: string): string {
    if(!this.sm4) this.sm4=new JSSM4(configs.info.appKey);
    return this.sm4.decryptData_ECB(str)
  }

  /**
   * encodeStringify
   *
   * convert from encoding formats such as Base64, Latin1 or Hex to WordArray objects and vice-versa.
   */
  static encodeStringify(data: any, type: EncodeType = 'Base64'): string {
    if (!data || !type) return '';

    const entity = typeof (data) !== 'string' ? JSON.stringify(data) : data;
    return CryptoJS.enc[type].stringify(CryptoJS.enc.Utf8.parse(entity));
  }

  /**
   * encodeParse
   *
   * convert from encoding formats such as Base64, Latin1 or Hex to WordArray objects and vice-versa.
   */
  static encodeParse(str: string, type: EncodeType = 'Base64'): string {
    if (!str || !type) return '';

    return CryptoJS.enc[type].parse(str).toString(CryptoJS.enc.Utf8);
  }

  /**
   * aesSimpleEncrypt
   *
   * AES-256 (the default)
   *
   * supports AES-128, AES-192, and AES-256. It will pick the variant by the size of the key you pass in. If you use a passphrase, then it will generate a 256-bit key.
   */
  static aesSimpleEncrypt(data: any, secret: string): string {
    if (!data || !secret) return '';

    const entity = typeof (data) !== 'string' ? JSON.stringify(data) : data;
    return CryptoJS.AES.encrypt(entity, secret).toString();
  }

  /**
   * aesSimpleDecrypt
   *
   * AES-256 (the default)
   *
   * supports AES-128, AES-192, and AES-256. It will pick the variant by the size of the key you pass in. If you use a passphrase, then it will generate a 256-bit key.
   */
  static aesSimpleDecrypt(str: string, secret: string): string {
    if (!str || !secret) return '';

    return CryptoJS.AES.decrypt(str, secret).toString(CryptoJS.enc.Utf8);
  }

  /**
   * aesEncrypt
   *
   * `modeType` supports the following modes:
   * * CBC (the default)
   * * CFB
   * * CTR
   * * OFB
   * * ECB
   *
   * `padType` supports the following padding schemes:
   * * Pkcs7 (the default)
   * * Iso97971
   * * AnsiX923
   * * Iso10126
   * * ZeroPadding
   * * NoPadding
   */
  static aesEncrypt(data: any, secret: string, ivLength = 16, modeType: AESModeType = 'CBC', padType: AESPadType = 'Pkcs7') {
    if (!data || !secret) return '';

    const entity = typeof (data) !== 'string' ? JSON.stringify(data) : data;

    const key = CryptoJS.enc.Utf8.parse(this.hashing(secret));
    const iv = CryptoJS.enc.Utf8.parse(this.hashing(secret).substr(0, ivLength));

    const srcs = CryptoJS.enc.Utf8.parse(entity);
    const options = { iv, mode: CryptoJS.mode[modeType], padding: CryptoJS.pad[padType] };
    const encrypted = CryptoJS.AES.encrypt(srcs, key, options);

    return encrypted.ciphertext.toString().toUpperCase();
  }

  /**
   * aesDecrypt
   *
   * `modeType` supports the following modes:
   * * CBC (the default)
   * * CFB
   * * CTR
   * * OFB
   * * ECB
   *
   * `padType` supports the following padding schemes:
   * * Pkcs7 (the default)
   * * Iso97971
   * * AnsiX923
   * * Iso10126
   * * ZeroPadding
   * * NoPadding
   */
  static aesDecrypt(str: string, secret: string, ivLength = 16, modeType: AESModeType = 'CBC', padType: AESPadType = 'Pkcs7') {
    if (!str || !secret) return '';

    const key = CryptoJS.enc.Utf8.parse(this.hashing(secret));
    const iv = CryptoJS.enc.Utf8.parse(this.hashing(secret).substr(0, ivLength));

    const encryptedHexStr = CryptoJS.enc.Hex.parse(str);
    const srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    const options = { iv, mode: CryptoJS.mode[modeType], padding: CryptoJS.pad[padType] };
    const decrypt = CryptoJS.AES.decrypt(srcs, key, options);
    const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);

    return decryptedStr.toString();
  }
}
