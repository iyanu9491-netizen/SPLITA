const paymentModel = require ('../model/payment')
const groupModel = require('../model/groupModel')
const userModel = require('../model/user')
const axios = require ('axios')

exports.initializePaystackPayment = async (req, res) =>{
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

        // create paymet data object
        const paymentData = {
            //amount: parseInt(group.contributionAmount)
            amount:group.contributionAmount * 100,
            currency: 'NGN',
            email:user.email,
            callback_url:'https://www.google.com/'
        }
        //initialize payment using Axios
        const response = await axios.post('https://api.paystack.co/transaction/initialize', 
            paymentData, {
                headers: {
                    Authorization:`Bearer ${process.env.PAYSTACK_API_KEY}`
                }
            })
            //create a payment record in your database
            const payment = new paymentModel({
                amount: paymentData.amount,
                reference:`TCA-Splita-${response.data?.data?.reference}`,
                userId,
                groupId,
                groupName: group.contributionAmount
            })
            await payment.save()

            res.status(200).json({
                message:'Payment initiated Succesfully',
                data:response.data?.data,
                // payment
            })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message:'Error initializing Payment '
        })
    } 
}
exports.verifyPaystackPayment = async (req, res)=>{
    try {
        //Extract refrence from the query params
        const {reference} = req.query
        //Verify the status of the payment from Paystack
        const {data} = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_API_KEY}`
            }
        });
        
        //update the payment in our app
        const payment = await paymentModel.findOne({reference: `TCA-Splita-${reference}`})
        if(!payment){
            return res.status(404).json({
                message: 'Payment not found'
            })
        }
        //check the status of the API and transaction if successful
        if(data?.status === true && data?.data.status === 'success'){
            //update the status of the payment
            payment.status = 'successful';
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
        console.log(error)
        res.status(500).json({
            message:'Error fetching Payment'
        })
    }
}