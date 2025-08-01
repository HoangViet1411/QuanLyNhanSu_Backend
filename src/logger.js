const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Tạo thư mục logs nếu chưa tồn tại
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Tạo file log nếu chưa tồn tại
const logFilePath = path.join(logDir, 'app.log');
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, '');
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    new winston.transports.File({ filename: logFilePath })
  ],
});

module.exports = { logger, logFilePath };
