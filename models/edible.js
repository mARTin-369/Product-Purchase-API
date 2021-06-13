const mongoose = require('mongoose')

const edibleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'price less than 0']
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'quantity less than 1']
  },
  updated: { 
    type: Date,
    default: Date.now 
  }
})

edibleSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Item already exists'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Edible', edibleSchema)