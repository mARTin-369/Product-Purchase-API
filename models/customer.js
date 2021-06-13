const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const customerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: 'Email address is required',
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: 'Password is required'
  },
  purchases: [
    {
      edible_id: {
        type: Schema.Types.ObjectId,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, 'quantity less than 0']
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ]
})

customerSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Email address already exists'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Customer', customerSchema)