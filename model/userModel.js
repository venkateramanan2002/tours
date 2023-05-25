const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name:
    {
        type:String,
        required:[true,"name can't be empty"]
    },
    email:
    {
        type:String,
        required:[true,"email can't empty"],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,"provide valid email"] 
    },
    photo:String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin']
      },
    passwod:{
        type:String,
        required:[true,"password should be must"],
        minlength: [8, "Password should be at least 8 characters long"],
        select:false,
        validate: {
            validator: function (value) {
                // Regex pattern to check for at least one digit and one special character
                const regex = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
                return regex.test(value);
            },
            message: "Password should contain at least one digit and one special character"
        }
},
passwordConfirm:
{
        //works only on create and save 
        type:String,
        required:[true,'please confirm your password'],
        validate:
        {
            validator:function(el)
            {
                return el == this.password;//abc==abc
            },
            message:"Both the passwords must be same"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken:String,
    passwordResetExpires:Date,
    active:
    {
        type:Boolean, 
        default:true,
        select:false
    }
   
});

//here if they had delete acc using deleteMe then state gone to false 
userSchema.pre( /^find/,function(next){
//this points to current query
this.find({active:{$ne:false}})
next();
})

userSchema.pre('save',function(next){
    if(!this.isModified('password')||this.isNew)return next();
    
    this.passwordChangedAt = Date.now()-1000;
    next();
})

userSchema.pre('save',async function(next){
    //only run if the password was actually modified
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,12)//12 is cost parameter for better password encryption 
    //to delete password confirm field 
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword,UserPassword)
{ 
    return await bcrypt.compare(candidatePassword,UserPassword);
}
userSchema.methods.changedPasswordAfter =function(JWTTimestamp)
{
    if(this.passwordChangedAt)
    {
        console.log(this.passwordChangedAt,JWTTimestamp);
    }
    return false;
}
userSchema.methods.createPasswordResetToken =function()
{
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    console.log({resetToken},this.passwordResetToken)
    this.passwordResetExpires = Date.now()+10*60*1000;
    return resetToken;
}


const User = mongoose.model('User',userSchema);
module.exports = User;