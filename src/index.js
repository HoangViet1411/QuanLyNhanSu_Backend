const express = require('express');
const dotenv = require('dotenv');
const { default: mongoose } = require('mongoose');
const routes = require('./routes');
const bodyParser = require('body-parser');
const path = require('path');


dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
routes(app);


mongoose.connect(`${process.env.MONGO_DB}`)
.then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});