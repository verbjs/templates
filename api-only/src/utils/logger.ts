import { config } from '../config';

enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

const LOG_LEVELS: Record<string, LogLevel> = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG
};

class Logger {
  private minLevel: LogLevel;

  constructor() {
    this.minLevel = LOG_LEVELS[config.logging.level] ?? LogLevel.INFO;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    if (level > this.minLevel) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      ...(meta && { meta }),
      service: 'api-only',
      pid: process.pid
    };

    console.log(JSON.stringify(entry));
  }

  error(message: string, meta?: any) {
    this.log(LogLevel.ERROR, message, meta);
  }

  warn(message: string, meta?: any) {
    this.log(LogLevel.WARN, message, meta);
  }

  info(message: string, meta?: any) {
    this.log(LogLevel.INFO, message, meta);
  }

  debug(message: string, meta?: any) {
    this.log(LogLevel.DEBUG, message, meta);
  }
}

export const logger = new Logger();