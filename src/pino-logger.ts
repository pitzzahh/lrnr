import { pinoLogger } from "hono-pino";
import pino from 'pino';
import pretty = require('pino-pretty');

export function logger() {
  return pinoLogger({
    pino: pino({
      level: process.env.LOG_LEVEL || 'info',
    }, pretty({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    })),
  });
}