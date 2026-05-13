const {initializePayment, verifyPayment, getAllPaymentByUser} = require('../controller/paymentController')
const{initializePaystackPayment, verifyPaystackPayment} = require('../controller/paystack')
const{Authentication} = require('../middlewares/auth')

const router = require('express').Router()

router.post('/:groupId', Authentication, initializePayment)
router.post('/paystack/:groupId', Authentication, initializePaystackPayment)

router.get('/verify-payment', Authentication, verifyPayment)
router.get('/verify-paystack', Authentication, verifyPaystackPayment)
router.get('/All-payment', Authentication,getAllPaymentByUser)

module.exports = router