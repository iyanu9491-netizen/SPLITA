const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,

    },
    otp: {
      type: String,
      trim: true,
      // default: () => {
      //   return Math.round(Math.random() * 1e6)
      //     .toString()
      //     .padStart(6, "0");
      // },
    },
    otpExpires:{
      type:Date,
      default:()=>{
        return Date.now() + ( 1000 * 60 * 7 )
      }
    },
    profilePicture: {
      secureUrl: {
        type: String,
        trim: true,
      },
      publicId: {
        type: String,
        trim: true,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: String,
      sparse: true,
      trim: true,
    },
    username: {
      type: String,
      default: function () {
        return `${
          this.fullname.slice(0, 4).trim() +
          Math.round(Math.random() * 1e3)
            .toString()
            .padStart(3, "0")
        }`;
      },
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("userInfos", userSchema);

module.exports = userModel;
