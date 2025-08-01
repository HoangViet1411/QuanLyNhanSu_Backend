const fs = require('fs');
const { logFilePath } = require('./logger');

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

function resetLogFileIfOld() {
  fs.stat(logFilePath, (err, stats) => {
    if (err) {
      console.error('Log cleaner error:', err);
      return;
    }

    const now = Date.now();
    const modifiedTime = new Date(stats.mtime).getTime();

    if (now - modifiedTime > THIRTY_DAYS) {
      fs.truncate(logFilePath, 0, () => {
        console.log('Log file reset after 30 days');
      });
    }
  });
}

module.exports = resetLogFileIfOld;
