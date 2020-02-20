const mongoose = require('mongoose');

const QrSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  codeUrl: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Qr', QrSchema);
