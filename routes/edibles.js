const express = require('express')
const router = express.Router()
const Edible = require('../models/edible')

//  GET all edibles quantity > 0
router.get('/fetch-edibles', async (req, res) => {
  try {
    const edibles = await Edible.find({ quantity: {$gt:0} })
    res.json(edibles)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST create an edible
router.post('/create-edible', async (req, res) => {
  // console.log(req.body)
  const edible = new Edible({
    name: req.body.name,
    type: req.body.type,
    price: req.body.price,
    quantity: req.body.quantity
  })
  try {
    const newEdible = await edible.save()
    res.status(201).json(newEdible)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// POST update edible quantity
router.post('/update-quantity', async (req, res) => {
    let edible
    if (req.body.id != null && req.body.quantity != null) {
      try {
        edible = await Edible.findById(req.body.id)
        if (edible == null) {
            return res.status(404).json({ message: 'Cannot find edible' })
        }      
      } catch (err) {
        return res.status(500).json({ message: err.message })
      }

      increment = parseInt(req.body.quantity)
      if(increment > 0) {
        edible.quantity += increment
        edible.updated = Date.now()
      } else {
        return res.status(400).json({ message: 'Invalid quantity' })
      }

      try {
        const updatedEdible = await edible.save()
        res.json(updatedEdible)
      } catch (err) {
        res.status(400).json({ message: err.message })
      }
    } else {
      res.status(400).json({ message: 'Missing fields values' })
    }
})

module.exports = router