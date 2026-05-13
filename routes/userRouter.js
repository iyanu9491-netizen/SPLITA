const router = require('express').Router();

const { createUser, updateProfile, verifyEmail, login, forgotPassword, resetPassword, changePassword, loginWithGoogle,getAllUsers } = require('../controller/user');
const { Authentication, adminAuth } = require('../middlewares/auth');
const upload  = require('../middlewares/multer');
const { profile, loginProfile } = require('../middlewares/passport');
const { signUpValidator,resetPasswordValidator,changePasswordValidator } = require('../middlewares/validator');

router.post('/user', createUser);
router.get('/all-user', Authentication, adminAuth, getAllUsers)
router.put ('/update/:id', upload.single('profilePicture'), updateProfile); 
router.post('/user/check' , verifyEmail)
router.post('/login', login)

router.post('/forgot-password', forgotPassword); 
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/change-password', Authentication, changePasswordValidator, changePassword);

router.get('/auth/google', profile)
router.get('/auth/google/callback', loginProfile,loginWithGoogle)


module. exports = router 