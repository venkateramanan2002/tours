const User = require('../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.checkID = async (req, res, next, val) => {
  try {
    const user = await User.findById(val);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid ID',
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1 create error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not for password update. Use /updateMyPassword', 400));
  }
  // 2 update user document
  // filtered unwanted field names which are not wanted to get updated
  const filterBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Retrieve all users from the database
  const users = await User.find();

  // Send response
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not yet defined',
  });
};

exports.deleteAllUsers = catchAsync(async (req, res, next) => {
  await User.deleteMany({});

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
