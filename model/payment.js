const mongoose = require ('mongoose')

const paymentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'userInfo',
        required: true
    },
    groupId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'userInfo',
        required: true
    },
    amount:{
        type:Number,
        required:true
    },
    reference: {
        type:String,
        required:true
    },
    groupName: {
        type:String,
        required:true
    },
    status: {
        type:String,
        enum:['processing', 'successful','failed','abandoned'],
        default:'processing'
    }
}, {timestamps:true})

const paymentModel = mongoose.model('payments', paymentSchema)

module.exports = paymentModel