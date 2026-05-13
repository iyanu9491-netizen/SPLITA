const groupModel = require('../model/groupModel')

exports.createGroup = async (req,res) => {
    
    try {
       const {groupName,contributionAmount,contributionFrequency,payoutFrequency,describeGroup, totalMembers } = req.body

        const group = new groupModel({
            groupName,
            contributionAmount,
            contributionFrequency,
            payoutFrequency,
            describeGroup,
            totalMembers,
            createdBy:req.user.id
        })
        group.members.push(req.user.id)
        await group.save()
        res.status(201).json({
            message:'Group sucessfully Created',
            data:group
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message:"Something went Wrong"
        })
    }
}
exports.getAllgroup = async (req, res)=> {
    try {
        const allGroup = await groupModel.find().populate('members', 'fullName')
        res.status(200).json({
            message:'Group found Succesfully',
            data: allGroup
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message:'Something went Wrong'
        })
    }
}
exports.getOneGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await groupModel.findById(groupId).populate('members', 'fullName email phoneNumber');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json({
      message: 'Group retrieved successfully',
      data: group,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      message: 'Something went wrong',
    });
  }
}
exports.removeMemberFromGroup = async (req, res)=>{
    try {
        //get the logged in user from the request user
        const { id } = req.user
        //get the group and member ID from the params
        const{ groupId, memberId} = req.params
        //check if group exist 
        if(!group){
            return res.status(404).json({
                message:'Group not Found'
            })
        }
        // check if the person ypu trying to remove is the admin
        if(group.createdBy.toString() !== id){
            return res.status(403).json({
                message:'Unauthorized Access, Not an Admin!'
            })
        }
        //check if the member to be removed is the Admin
        if(group.createdBy.toString() === memberId){
            return res.status(403).json({
                message:'Unathorized Access, Cannot Remove Admin'
            })
        }
        //check if members belong to group
        const memberIndex = group.members.findIndex((element) => element.toString() === memberId)
        if(memberIndex == -1){
            return res.status(404).json({

                message:'User is not a member of this Group'
            })
        }

        //remove the user from the group member
        group.members.splice(memberIndex, 1)

        await group.save()

        res.status(200).json({
            message:'Member removed Successfully',
            data:group
        })
    }catch (error) {
        res.status(500).json({
            message:'Something went Wrong'
        })
    }
}

