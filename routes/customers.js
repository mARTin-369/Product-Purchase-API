require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()
const Customer = require('../models/customer')
const Edible = require('../models/edible')
const {authenticateToken} = require('../middleware')

router.post('/signup', async (req, res) => {
  if (req.body.email != null && req.body.password != null) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      const customer = new Customer({
          email: req.body.email,
          password: hashedPassword
      })

      const newCustomer = await customer.save()
      res.status(201).json(newCustomer)
      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  } else {
    res.status(400).json({ message: 'Missing fields values' })
  }
})

router.post('/signin', async (req, res) => {
  try {
    const customer = await Customer.findOne({ email: req.body.email })
    // console.log(customer)
    if(customer != null && await bcrypt.compare(req.body.password, customer.password)) {
      const accessToken = jwt.sign({
        id: customer._id,
        email: customer.email
      }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 60*5 })
      res.json({ accessToken: accessToken, message: 'Signin successful' })
    } else {
      res.status(400).json({ message: 'Invalid Credentials' })
    }
  } catch(err) {
    res.status(500).json({ message: err.message })
  }
})


router.post('/purchase-edibles', authenticateToken, async (req, res) => {
  if(req.body.id != null && req.body.quantity != null) {
    const session = await mongoose.startSession()

    try {
      const edible = await Edible.findById(req.body.id)
      const customer = await Customer.findById(req.customer.id)
      if(edible == null){
        return res.status(400).json({ message: 'Item not found' })
      } else if(req.body.quantity > edible.quantity || req.body.quantity < 1) {
        return res.status(400).json({ message: 'invalid quantity' })
      }
      customer.purchases.push({
        edible_id: edible._id,
        quantity: req.body.quantity,
        date: Date.now()
      })

      total_price = req.body.quantity*edible.price
      edible.quantity -= req.body.quantity
      
      session.startTransaction()
      await edible.save({session})
      throw new Error('some error')
      await customer.save({session})
      await session.commitTransaction()
      session.endSession()

      res.json({ amount: total_price })

    } catch(err) {
      await session.abortTransaction()
      session.endSession()
      console.log(err)
      res.status(500).json({ message: err.message })
    }
  } else {
    res.status(400).json({ message: 'Missing fields values' })
  }
})

router.get('/check-purchase/:id', authenticateToken, async (req, res) => {
  try{
    const customer = await Customer.findById(req.customer.id)
    // console.log(req.params.id)
    const purchased = customer.purchases.some(purchase => purchase.edible_id == req.params.id)
    res.json({ purchased: purchased })
  } catch(err) {
    res.status(500).json({ message: err.message })
  }  
})

module.exports = router