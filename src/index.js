const express = require('express');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const routes = require('./routes');
const bodyParser = require('body-parser');
const path = require('path');

// Import logger và log-cleaner
const { logger } = require('./logger');
const resetLogFileIfOld = require('./log-cleaner');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Gọi hàm kiểm tra log file có quá 30 ngày không
resetLogFileIfOld();

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Khởi tạo routes
routes(app);

// Kết nối MongoDB
mongoose.connect(`${process.env.MONGO_DB}`)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error(`Error connecting to MongoDB: ${err}`);
  });

// Khởi động server
app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});
