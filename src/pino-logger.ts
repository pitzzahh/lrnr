import { pinoLogger } from "hono-pino";
import pino from 'pino';
import pretty = require('pino-pretty');

export function logger() {
  return pinoLogger({
    pino: pino(pretty({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    })),
  });
}