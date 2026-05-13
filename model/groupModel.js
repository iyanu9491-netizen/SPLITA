// const { string } = require("joi");
const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userInfo",
        required:true
    },
    contributionAmount: {
      type: String,
      required: true,
      trim: true,
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userInfos',
    }],
    contributionFrequency: {
      type:String,
      enum:['daily','weekly','monthly'],
      required: true,
      trim: true
    },
    payoutFrequency: {
      type: String,
      enum:['daily','weekly','monthly'],
      required: true,
      trim: true
    },
    describeGroup: {
      type: String,
      required:true,
      trim: true
    },
    totalMembers:{
      type:String,
      required:true
    }
  },{timestamps: true}
);

const groupModel = mongoose.model("groupInfo", groupSchema);

module.exports = groupModel;
