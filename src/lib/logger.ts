type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatTime(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, message: string, ...args: unknown[]) {
  const prefix = `[${formatTime()}] [${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(prefix, message, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, message, ...args);
  } else if (level === 'debug') {
    if (process.env.NODE_ENV === 'development') {
      console.log(prefix, message, ...args);
    }
  } else {
    console.log(prefix, message, ...args);
  }
}

export const logger = {
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
};
