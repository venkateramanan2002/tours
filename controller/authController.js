const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const crypto = require('crypto')
const {promisify} = require('util');
const AppError = require('./../utils/appError');
const sendMail = require('../utils/mailer')
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn:3600
  });
};
const createSendToken = (user,statusCode,res) =>
{
  const token = signToken(user._id);
  const cookieOptions = {
    expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
    httpOnly:true
  }
  if(process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt',token,cookieOptions);
  
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    },
  });
} 
  
  exports.signup = catchAsync(async (req, res, next) => {
  
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser,201,res);

  // Generate a token for the new user
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});   

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  // Check if the email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide a valid email and password', 400));
  } 

  // Check if the user exists and the password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email or password is incorrect', 401));
  }

  // Generate a token for the authenticated user
  createSendToken(user,200,res);
 
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //1 Get the token from the request headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  //Verify the token
  if (!token) {
    return next(new AppError('Unauthorized', 401));
  }

    //2Verify the token and extract the decoded payload
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3 Check if the user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) { 
      return next(new AppError('User not found', 404));
    }
    
    //4 Check if the user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('Password changed. Please log in again.', 401));
    }

    //5 Grant access to the protected route
    req.user = currentUser;
    next();
 
}); 

exports.restrictTo = (...roles) =>
{
  return(req,res,next)=>
  {
    //roles : ['admin','lead-guide']
    if(!roles.includes(req.user.role))
    {
      return next(new AppError("you don't have permission to perform this action",401))
    }
    next();
  }
}

exports.forgotPassword = catchAsync(async(req,res,next) =>
{
  //1 get user based on posted email
  const user = await User.findOne({email:req.body.email})
if(!user){                     
  return next(new AppError('there is no user with this email ',404))
}
  //2 random token 
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave:false});
  //3 send tooken through email 
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

  const message = `forgot password submit a PATCH request with new password and passwordConfirm to ${resetURL} \n if you didn't forgot the password pls ignore this email `
  try
  {

    await sendMail({
      email:user.email,
      subject:'your pass reset token (valid for 10mins)',
    message
  });
  res.status(200)
  .json({
    status:'success',
    message:'token sent to email successfully'
  })
}
catch(err)
{
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({validateBeforeSave:false});

  return next(new AppError('there was a error sending email '),500)
}
})

exports.resetPassword =catchAsync(async(req,res,next) =>
{
  createSendToken(user,200,res);
//1 Get user based on the token
const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
const user = await User.findOne({
  passwordResetToken:hashedToken,
  passwordResetExpires:{$gt:Date.now()}
});
//2If token has not expired, and there is user, set the new password
if(!user)
{
  return next(new AppError('token is invalid or expired'),400);
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetExpires = undefined;
user.passwordResetToken = undefined;
await user.save();
//3 Update changedPasswordAt property for the user 

//4 Log the user in, send JWT
const token = signToken(user._id);
res.status(200)
.json({
  status:'success',
  token
})
}
)
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if the current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3. If the password is correct, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4. Log the user in and send the JWT token
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
