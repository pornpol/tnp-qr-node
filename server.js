const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');
const errorHandler = require('./middlewares/error');
const connectDB = require('./config/db');
const fs = require('fs');

dotenv.config({ path: './config/config.env' });

if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public');
}

if (!fs.existsSync('./public/pdfs')) {
  fs.mkdirSync('./public/pdfs');
}

connectDB();

const qrsRouter = require('./routes/qrs');

const app = express();

app.use(express.json());
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/qrs', qrsRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
  );
});
// server.setTimeout(500000);

// Handle unhandeled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
