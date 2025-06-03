import { pinoLogger } from "hono-pino";
import pino from 'pino';
import pretty = require('pino-pretty');
import env from "@/env";

export function logger() {
  return pinoLogger({
    pino: pino({
      level: env.LOG_LEVEL || 'info',
    }, pretty({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    })),
  });
}