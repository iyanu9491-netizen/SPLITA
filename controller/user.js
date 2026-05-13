const userModel = require('../model/user');
require('dotenv').config
const fs = require('fs')
const cloudinary = require('../middlewares/cloudinary')
const bcrypt = require('bcrypt')
const {brevo} = require('../utils/brevo')
const jwt = require('jsonwebtoken');
const {emailTemplate, resetPasswordTemplate, resetPasswordSuccessfulTemplate} = require('../email');
const otpGenerator = require('otp-generator')

exports.createUser = async(req, res)=>{ 
    
    try {
        const {fullname,email,phoneNumber,password} = req.body

        const otp = otpGenerator.generate(6, {upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false})


        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt)

        const user =  new userModel({
        fullname,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashPassword,
        otp
       })
    //    console.log(user)
       brevo(user.email,user.fullname,emailTemplate(user.fullname,user.otp))
       //console.log(emailTemplate)
       await user.save()

       res.status(201).json({
        message:"User Created Successfully",
        data:user
       })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message:'Error creating User',
            error: error.message
        })
        
    }
}
exports.updateProfile = async(req, res)=>{
    try {
        const files = req.file;
        console.log(files)
        const filePath = files['path']

        const uploadToCloudinary = await cloudinary.uploader.upload(filePath);
        const extractSecureurl = {secureUrl:uploadToCloudinary.secure_url, publicId: uploadToCloudinary.public_id}
        console.log(`hello: `, extractSecureurl)
        fs.unlinkSync(filePath)


        const {bankName, accountNumber} = req.body
        const {id}= req.params
        console.log('ID:',id);
        
        const user = await userModel.findById(id);
        console.log('user:',user);
        
        const updateUser = await userModel.findByIdAndUpdate(id, 
        {
            bankName,
            accountNumber,
            profilePicture: extractSecureurl
        },
        {
        new: true
        })
        res.status(200).json({
            message: "User profile updated successfully",
            data: updateUser
        })
    } catch (error) {
        res.status(500).json({
            message: "Error updating user profile",
            error: error.message
        })
    }
}
exports.verifyEmail = async(req,res)=>{
    try {
        const{email, otp}= req.body
        const user = await userModel.findOne({ email: email})
        console.log(user)
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        if(user.otp !== otp){
            return res.status(400).json({
                message: "Invalid OTP credentials"
            })
        }
        if(Date.now()> user.otpExpires){
            return res.status(400).json({
                message:"OTP Expired"
            })
        }
        user.isVerified = true
        await user.save()
        res.status(200).json({
            message:'OTP Verified successfully'
        })
    } catch (error) {
        console.log(error.message )
        res.status(500).json({
            message:'something went wrong'
        })
    }
}
exports.login = async (req, res )=>{
    try {
        const{email,password}=req.body
        const user = await userModel.findOne({email: email})
        console.log(user)
        if(!user){
            return res.status(404).json({
                message:'Invalid credentials'
            })
        }
        const correctPassword = await bcrypt.compare(password, user.password)

        if(!correctPassword){
            return res.status(400).json({
                message:'Invalid credentials'
            })
        }
        if(user.isVerified = false){
            return res.status(400).json({
                message:"please verify your email"
            })
        }
        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.SECRET_KEY,
            {expiresIn:'1d'}
        );
        
        res.status(200).json({
            message:"login sucessful",
            token,
            user
        })
    
    } catch (error) {
        console.log(error),
        res.status(500).json({
            message:'something went wrong'
        })
    }
}
exports.forgotPassword = async (req, res)=>{
    try {
        const {email} = req.body 
         
        const user = await userModel.findOne({email: email.toLowerCase()})

        if(user == null){
            return res.status(404).json({
                message:'Invalid Credentials'
            })
        }
            //generate otp
            const OTP = Math.round(Math.random() * 1e6).toString().padStart(6, "0")
            //update the user with the new otp
            user.otp = OTP 
            //set expiry date
            user.otpExpires = Date.now() + (1000 * 60 * 7)  
            //create the data object or email template
            const data = {
                name: user.fullname,
                otp: OTP
            }
            await brevo(email, user.fullname, resetPasswordTemplate(data))
            await user.save()

            res.status(200).json({
                message:'Forgot Password successful'
            })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.resetPassword = async (req, res)=>{
    try {
        const {otp, password, email} = req.body
        

        const user = await userModel.findOne({email: email.toLowerCase()})

        if(user == null){
            return res.status(404).json({
                message:'Invalid Credentials'
            })
        }
        console.log(Date.now() > user.otpExpires);
        if ( Date.now() > user.otpExpires || user.otp !== otp ){
            return res.status(400).json({
                message:'Invalid OTP'
            })
        }
        //reset the users password with the encrypted and updated password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
        await user.save()
        brevo(user.email, user.fullname, resetPasswordSuccessfulTemplate(user.fullname));
        res.status(200).json({
            message: 'Password reset successfully'
        })


        res.status(200).json({
            message:'Password reset successfully'
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.changePassword = async (req, res)=>{
    try {
        //extract from the user ID
        const {id} = req.user
        
        const {oldPassword, newPassword} = req.body

        const user = await userModel.findById(id)
        //check if user exist
        if(!user){
            return res.status(404).json({
                message:'User not found'
            })
        }
        //confirm the old password 
        const checkPassword = await bcrypt.compare(oldPassword,user.password)
        if(!checkPassword){
            return res.status(400).json({
                message:'Old password is Invalid'
            })
        }
        //encrypt and change new password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)
        user.password = hashedPassword

        await user.save()

        res.status(200).json({
            message:'Password chnaged Succesfully'
        })
    } catch (error) {
        console.lo(error.message)
        res.status(500).json({
            message:error.message
        })
    }
}
exports.loginWithGoogle = async (req, res)=>{
    try {
       const token = await jwt.sign({
        id: req.user._id,
        role: req.user.role
       },process.env.SECRET_KEY, {expiresIn: '1d'})
         
       res.status(200).json({
        message:'Login Successful',
        data: req.user.fullname,
        token
       })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.getAllUsers = async (req, res) =>{
    try {
        const users = await userModel.find()
        //send a success response 
        res.status(200).json({
            message:'Found All Users',
            data:users
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}
exports.deleteUser = async (req, res) =>{
    try {
        const { id }= req.params
        const users = await userModel.findByIdAndDelete(id)
        if(!users){
            return res.status(404).json({
                message:'User not Found'
            })
        }
        res.status(200).json({
            message:'User deleted Successfully',
            data: users
        })
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
    }
}
exports.getAllUsers = async(req, res) =>{
  try {
    const users = await userModel.find();
    //Send a success response
    res.status(200).json({
      message: 'All users',
      data: users
    })
  } catch (error) {
    res.status(500).json({
      message: error.message
    })
  }
}