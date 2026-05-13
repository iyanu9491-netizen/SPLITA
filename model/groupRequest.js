const mongoose = require ('mongoose')

const requestSchema = new mongoose.Schema({
    groupId:{
        type:mongoose.Schema.ObjectId,
        ref: 'groupInfo'
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref: 'userInfo'
    },    
    groupName:{
        type:String,
        trim:true
    },
    status:{
        type:String,
        Enum:['Pending','Accepted','Rejected'],
        default:'pending'
    },
    userInfo:{
        type:String,
        required:true
    }
}, {timestamps: true})

const requestModel = mongoose.model('requests', requestSchema)

module.exports = requestModel