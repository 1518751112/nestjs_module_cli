import {pathConstant} from '@common/constant';
import {Injectable, LoggerService} from '@nestjs/common';
import {createLogger, format, Logform, Logger, LoggerOptions, transports} from 'winston';
import * as configs from "@common/config";

/**
 * Use Winston as the default logging processor for your project
 */
@Injectable()
export class LoggerProvider implements LoggerService {
  /**
   * Winston logger
   */
  private readonly instance: Logger;

  /**
   * Constructor
   */
  public constructor() {
    this.instance = createLogger(this.getOptions());
  }

  /**
   * Log output method
   */
  public log = (message: string) => this.instance.info(message);
  public info = (message: string) => this.instance.info(message);
  public warn = (message: string) => this.instance.warn(message);
  public debug = (message: string) => this.instance.debug(message);
  public error = (message: string) => this.instance.error(message);

  /**
   * Formatted print output
   */
  private format(info: Logform.TransformableInfo) {
    const pid = process.pid;
    const message = info.message;
    const timestamp = info.timestamp;
    const env = configs.info.env;
    const appName = configs.info.appName;
    const level = info.level.toLocaleUpperCase();

    return `[${appName}] ${pid} - ${timestamp} [${env}] ${level}: ${message}`;
  }

  /**
   * Get Winston configuration information
   */
  private getOptions(): LoggerOptions {
    const dirname = pathConstant.logs;

    return {
      level: 'debug', // Only log less than the DEBUG level.
      exitOnError: false,
      handleExceptions: true,
      exceptionHandlers: new transports.File({ dirname, filename: 'stderr.log' }),
      transports: [
        new transports.Console({
          silent: !configs.info.enableConsoleLoging,
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(message => this.format(message)),
            format.colorize({ all: true }),
          ),
        }),
        new transports.File({
          silent: !configs.info.enableFileLoging,
          dirname,
          level: 'info',
          filename: 'stdout.log',
          maxsize:60*1024*1024, //60MB 设置日志记录文件大小
          maxFiles:50,  //设置记录文件分割数量
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(message => this.format(message)),
          ),
        }),
        new transports.File({
          silent: !configs.info.enableFileLoging,
          dirname,
          level: 'error',
          filename: 'stderr.log',
          maxsize:60*1024*1024, //60MB 设置日志记录文件大小
          maxFiles:50,  //设置记录文件分割数量
          format: format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.printf(message => this.format(message)),
          ),
        }),
      ],
    };
  }
}
