const joi = require ('joi')

exports.signUpValidator = (req, res, next)=>{
    // const schema = joi.object ({
    //    fullName:joi.string().trim().min(4).required(),
    //    email:joi.string().email().required(),
    //    phoneNumber:joi.string().alphanum().min(8).required()
    // })
const schema = joi.object({
    fullname: joi.string().trim().pattern(/^[A-Za-z\s]{4,}$/).required().messages({
        'any.required': 'Full Name is required',
        'string.empty':'Fullname cannot be Empty',
        'string.pattern.base': 'Fullname cannot contain numbers and must be atleast 4 characters'
    }),
    email:joi.string().email().required().messages({
        'any required':'Email is required',
        'string.empty':'Email cannot be Empty',
        'string.email':'Email must be a valid email',
    }),
    phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
        'any required':'Phone number is required',
        'string.empty':'Phone number cannot be empty',
        'string.pattern.base':'Phone number must contain only 4 digits'
    }),
    password:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
        'any required':'Password is required',
        'string.empty':'Password cannot be Empty',
        'string.pattern.base':'Password must be 8 chracters must include upper and lower case'
    })
})

const {error}= schema.validate(req.body)
if(error) {
    return res.status(400).json({
        message:error.details[0].message
    })
}
next()
}

exports.groupValidator = (req, res, next) => {
    const schema = joi.object({
        groupName: joi.string().trim().pattern(/^[A-Za-z\s]{6,}$/).required().messages({
            'any.required': 'Group name is required',
            'string.empty': 'Group name cannot be Empty',
            'string.pattern.base': 'Group name cannot contain numbers and must be at least 6 characters'
        }),
        contributionAmount: joi.string().pattern(/^\d+(\.\d{1,2})?$/).required().messages({
            'any.required': 'Contribution amount is required',
            'string.empty': 'Group name cannot be Empty',
            'string.pattern.base': 'Amount must be a valid number'
        }),
        contributionFrequency: joi.string().valid("daily","weekly","monthly").required().messages({
            'any.required': 'Contribution Frequency is required',
            'string.empty':'contributionFrequency cannot be empty its must require [dail,weekly,monthly]'
        }),
        payoutFrequency: joi.string().required().messages({
            'any.required': 'Payout Frequency is required',
            'string.empty':'Payout Frequency cannot be empty its must require [dail,weekly,monthly]'
        }),
        describeGroup: joi.string().min(10).required().messages({
             'any.required': 'Describe Group is required',
            'string.empty': 'Describe Group is not allowed to be Empty'
        }),
        totalMembers: joi.number().min(2).max(12).required().messages({
            'number.max':'total members must be less than or equal to 12',
            'number.base':'total members must be a number'
        }),
    });
   const { error } = schema.validate(req.body);

    // console.log(error.details)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.resetPasswordValidator = async (req, res, next)=>{
    const schema = joi.object({
         email:joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
            }),
            otp:joi.string().pattern(/^\d{6}$/).required().messages({
                'any.required': 'OTP is required',
                'string.empty': 'OTP cannot be empty',
               'string.pattern.base': 'OTP must only contain digits and must be 6 digits'
            }),
            password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'Password is required',
                'string.empty': 'Password cannot be empty',
               'string.pattern.base': 'Password must be at least * characters and must Include 1 uppercase and 1 lowercase'
            }),
            confirmPassword:joi.string().required().valid(joi.ref('password')).messages({
                'any.only':'Confirm password must match password',
                'any.required':'Confirm password is required'
            })
    })
    const { error } = schema.validate(req.body);

    // console.log(error.details)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
exports.changePasswordValidator = (req,res,next)=>{
    const schema = joi.object({
        oldPassword:joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'Old password is required',
                'string.empty': 'Old Password cannot be empty',
               'string.pattern.base': 'Old Password must be at least * characters and must Include 1 uppercase and 1 lowercase'
            }),
             newPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
                'any.required': 'new Password is required',
                'string.empty': 'new Password cannot be empty',
               'string.pattern.base': 'new Password must be at least * characters and must Include 1 uppercase and 1 lowercase'
            }),
            confirmPassword:joi.string().required().valid(joi.ref('newPassword')).messages({
                'any.only':'Confirm password must match new password',
                'any.required':'Confirm password is required'
            })
    })
    const { error } = schema.validate(req.body);

    // console.log(error.details)
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        });
    }
    next();
}
    