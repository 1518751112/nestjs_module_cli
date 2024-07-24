import * as xml2js from "xml2js";
import * as crypto from "crypto";

export function buildXML(json) {
  var builder = new xml2js.Builder({
    renderOpts: { pretty: false, cdata: true },
  });
  return builder.buildObject(json);
}

export function md5(p_value) {
  return crypto.createHash("md5").update(p_value, "utf8").digest("hex");
}

export function decryptData256(encryptedData, key) {
  encryptedData = Buffer.from(encryptedData, "base64");
  var iv = "";
  let decipher = crypto.createDecipheriv("aes-256-ecb", md5(key), iv);
  decipher.setAutoPadding(true);
  let decoded = decipher.update(encryptedData, "base64", "utf8");
  decoded += decipher.final("utf8");
  return decoded;
}

export async function parseXML(xmlString) {
  return new Promise((resolve, reject) => {
    var parser = new xml2js.Parser({
      trim: true,
      explicitArray: false,
      explicitRoot: false,
    });
    parser.parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

/**
 * 自定义函数名：prefixZero
 * @param num： 被操作数
 * @param n： 固定的总位数
 */
export function prefixZero(num, n) {
  return (Array(n).join("0") + num).slice(-n);
}

/**
 * weekDesc
 * @param iosWeek： IOS星期 1-7 7为周日
 */
export function weekDesc(iosWeek: number) {
  return "一二三四五六日".charAt(iosWeek - 1);
}
