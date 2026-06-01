import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level}: ${message} ${metaString} ${stack ? '\n' + stack : ''}`;
  })
);

// Configure transports
const transportInfo = new winston.transports.DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  level: 'info'
});

const transportError = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    transportError,
    transportInfo
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Always log to console as well
logger.add(new winston.transports.Console({
  format: consoleFormat
}));
