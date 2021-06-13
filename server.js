require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.urlencoded({ extended: true }));

const customersRouter = require('./routes/customers')
const ediblesRouter = require('./routes/edibles')

app.use('/customers', customersRouter)
app.use('/edibles', ediblesRouter)

app.listen(3000, () => console.log('Server Started ....'))