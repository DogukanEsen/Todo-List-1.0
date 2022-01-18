const mongoose = require('mongoose')

const infSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
        type: String,
        required: true,
    },
    Date: {
        type: Date,
        required: true,
        default: Date.now,
    },
    Id: {
      type: String,
      required: true
  } 
  });
  
  const inf = mongoose.model("inf", infSchema);
  module.exports = inf;