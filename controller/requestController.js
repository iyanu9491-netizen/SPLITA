const groupModel = require('../model/groupModel')
const requestModel = require('../model/groupRequest')
const userModel = require('../model/user')

exports.createRequest = async(req, res)=>{
    try {
        //get the user id from the request user
        const { id } = req.user
        //Get group Id from the prams
        const {groupId} = req.params
        //check if group exist 
        const group = await groupModel.findById(groupId)
        if(!group){
            return res.status(400).json({
                message:'Group not found'
            })
        }
        //find and check if user still exist
        const user = await userModel.findById(id)
        if(!user){
            return res.status(400).json({
                message:'User not found'
            })
        }

        // create an instance of the group request
        const request = new requestModel({
            groupId,
            groupName:group.groupName,
            userId: id,
            userInfo:user.fullname

        })
        //save changes to the data base
        await request.save()

        // send  SUCCESS RESPONSE
        res.status(200).json({
            message:'Request sent Successfully',
            data: request

        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.acceptRequest = async (req, res)=>{
    try {
        //get the admin ID from the request user
        const adminId = req.user.id
        // Get the request ID from the params
        const { requestId } = req.params
        //check if request exist
        const request = await requestModel.findById(requestId)
        if(!request) {
            return res.status(404).json({
                message:'Request not Found'
            })
        }
        if(request.status === 'Accepted' || request.status === 'Rejected'){
            return res.status(400).json({
                message: 'Requested already Processed'
            })
        }
        //Find the group and confirm if the admin Id matches the group Admin
        const group = await groupModel.findById(request.groupId)
        if(!group){
            return res.status(404).json({
                message:'Group not Found'
            })
        }
        //confirm the Admin the ID
        if(group.createdBy.toString() !==adminId){
            return res.status(403).json({
                message:'Unauthorized: Not an Admin'
            })
        }
        //add the user to the group and update the status of the request
        group.members.push(request.userId)
        request.status ='Accepted'

        // save the changes to the database
        await group.save()
        await request.save()

        res.status(200).json({
            message:'Requested Accepted successfully ',
            data: request
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.rejectRequest = async (req, res)=>{
    try {
        //get the admin ID from the request user
        const adminId = req.user.id
        // Get the request ID from the params
        const { requestId } = req.params
        //check if request exist
        const request = await requestModel.findById(requestId)
        if(!request) {
            return res.status(404).json({
                message:'Request not Found'
            })
        }
        if (request.status === 'Accepted' || request.status === 'Rejected'){
            return res.status(400).json({
                message:'Request Already Processed'
            })
        }
        //confirm the Admin ID
        if(group.createdBy.toString() !==adminId){
            return res.status(403).json({
                message:'Unauthorized: Not an Admin'
            })
        }
        //add the user to the group and update the status of the request
        group.members.push(request.userId)
        request.status ='Rejected '

        // save the changes to the database
        await request.save()

        res.status(200).json({
            message:'Requested rejected successfully ',
            data:request 
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.allRequestForAdmin = async (req, res) =>{
    try {
        //get the logged in user ID from the request user
        const { id } = req.user
        const { groupId } = req.params

        // find the group and confirm if the Admin id matches the group admin
        const group = await groupModel.findById(groupId)
        if(!group){
            return res.status(404).json({
                message:'Group not Found'
            })
        }
        //find All request for the group and group admin
        const requests = await requestModel.find({groupId})

        res.status(200).json({
            message:'All request Found',
            data:requests
        })
    } catch (error) {
        res.status(500).json({
            messsge:error.message
        })
    }
}