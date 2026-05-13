const paymentModel = require ('../model/payment')
const groupModel = require('../model/groupModel')
const userModel = require('../model/user')
const axios = require ('axios')
const otpGenerator = require('otp-generator')

exports.initializePayment = async (req, res) =>{
    try {
        //get the user Id from the req.user
        const userId = req.user.id
        //get the group Id from the params
        const { groupId } = req.params
        //check if user still exists
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                message: 'User not Found'
            })
        }
        // check if group exist 
        const group = await groupModel.findById(groupId)
        if(!group){
            return res.status(404).json({
                message:'Group not Found'
            })
        }
        //check if  user is already a member of the group
        const member = group.members.find((member) => member.toString() === userId)
        if(!member){
            return res.status(403).json({
                message: 'User is not a member of this group'
            })
        }
        //generate refrence
        const ref = otpGenerator.generate(12, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})
        const reference = `TCA-Splita-${ref}`

        // create paymet data object
        const paymentData = {
            //amount: parseInt(group.contributionAmount)
            amount:Number(group.contributionAmount),
            currency: 'NGN',
            reference,
            customer:{
                email:user.email,
                name:user.fullname
            },
            redirect_url:'https://www.google.com/'
        }
        //initialize payment using Axios
        const response = await axios.post('https://api.korapay.com/merchant/api/v1/charges/initialize', 
            paymentData, {
                headers: {
                    Authorization:`Bearer ${process.env.KORA_API_KEY}`
                }
            })
            //create a payment record in your database
            const payment = new paymentModel({
                amount: paymentData.amount,
                reference,
                userId,
                groupId,
                groupName: group.groupName
            })
            await payment.save()

            res.status(200).json({
                message:'Payment initiated Succesfully',
                data:response.data?.data,
                payment
            })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message:'Error initializing Payment '
        })
    } 
}
exports.verifyPayment = async (req, res)=>{
    try {
        //Extract refrence from the query params
        const {reference} = req.query
        //Verify the status of the payment from Kora
        const {data} = await axios.get(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.KORA_API_KEY}`
            }
        });
        
        //update the payment in our app
        const payment = await paymentModel.findOne({reference})
        if(!payment){
            return res.status(404).json({
                message: 'Payment not found'
            })
        }
        //check the status of the API and transaction if successful
        if(data?.status === true && data?.data.status === 'success'){
            //update the status of the payment
            payment.status = data?.data.status
            await payment.save()

            return res.status(200).json({
                message:'Payment Verified Successfully',
                data: payment 
            })
        }else{
            payment.status = 'Failed'
            await payment.save()

            return res.status(200).json({
                message:'Payment Verification Failed',
                data:payment
            })
        }
        
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message:'Error fetching Payment'
        })
    }
}
exports.getAllPaymentByUser = async (req, res)=>{
    try {
        //Extract the user Id from the req.user
        const userId = req.user.id
        //check if user still exist
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }
        //find all payment made by the user
        const allPayments = await paymentModel.find({ userId}).sort({createdAt: -1})

        res.status(200).json({
            message:'All User Payment Found',
            data:allPayments
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}