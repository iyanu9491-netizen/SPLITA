require('dotenv').config();
require('./config/database');
require('./model/user')
const express = require("express");
const PORT = process.env.PORT || 7070;

const swaggerUi = require('swagger-ui-express')
const swagger = require ('./documentation')
const expressSession = require('express-session')
const {passport} = require('./middlewares/passport')

const userRouter = require('./routes/userRouter')
const groupRouter = require('./routes/groupRouter')

const requestRouter = require('./routes/requestRouter')

const paymentRouter = require('./routes/paymentRouter')
const app = express();
app.use(express.json());

app.use(expressSession({
  secret:'michael',
  resave:true,
  saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/apisDocs', swaggerUi.serve,swaggerUi.setup(swagger))

app.use('/api/v1',userRouter)
app.use('/api/v1',groupRouter)
app.use('/api/v1',requestRouter)
app.use('/api/v1/payment',paymentRouter)

app.use((req,res)=>{
  res.status(404).json({
    message:'Route not Found'
  })
})

app.use((req,res)=>{
  if(err.name === 'TokenExpiredError'){
    return res.status(401).json({
      message:'Session expired: Please login to continue'
    })
  }

  if(err.name === 'MulterError'){
    return res.status(400).json({
      message:err.message
    })
  }
  res.status(500).json({
    message:'Something went wrong'
  })
})

app.use((err, req, res, next)=>{
  res.status(500).json({
    message:err.message
  })
})

app.listen(PORT, () => {
  console.log(`Server is listening to Port:${PORT}`);
});