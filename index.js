const express = require('express');

const dbconection = require('./dbcon')

const employ = require('./controllers/userController')
const userRoutes = require('./routes/userRoutes')


const app = express();
app.use('/',userRoutes)
app.listen(8000,(req,res)=>{
    console.log('server runung on 8000....')
})