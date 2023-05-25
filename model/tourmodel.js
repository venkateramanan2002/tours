const mongoose = require('mongoose');
const validator = require('validator')
const slugify = require('slugify');
const tourSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'a tour must have a named'],
        unique:true,
        maxlength:[40,'more characters are here'],
        minlength:[3, 'character are much minimum '],
        // validate:[validator.isAlpha,'Tour name should contain characteres']
    },
    slug:String,
    difficulty:{
        type:String,
        default:[true,'a tour must have difficult']
    },
    secretTour: 
    {
        type:Boolean, 
        default:false
    },
    startLocation:
    {
        type:
        {
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String
    },
    locations:
    {
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number
    },
    price:
    {
        type:Number,
        required:[true,'a tour must have a price']
    },
    duration:
    {
        type:Number,
        required:[true,'a tour must have a duration']
    },
    maxGroupSize:
    {
        type:Number,
        required:[true,'a tour must have a group size']
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,"ratings must be above 1" ], 
        max:[5.0,"ratings must be below 5"]
    },
    ratingsQuantity:
    {
        type: Number,
        default:0
    },
    difficulty:{
        type:String,
        default:[true,'a tour must have difficult'],
        enum:
        {
            values:['easy','medium','difficult'],
            message:'difficulty is either easy medium or difficult'
        }
        },
    
    priceDiscount:
    {
        type:Number,
        validate:
        {
            validator:function(val){ 
                //this only points on current document on new document creation
                return val < this.price //1
            },
            // here the VALUE will be taken from function it's mongoose internal function
            message:'dicount price ({VALUE}) should be less than regular price'
        } 
        
        
       
    },
    summery:
    {
        type:String,
        trim:[true,'a tour must have a summery'],
    },
    description:{
        type:String,
        trim:true
    },
    
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date]
  }, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)

tourSchema.virtual('durationWeeks').get(function() 
{
    return this.duration/7
})

tourSchema.pre('save',function(next)
{
    this.slug = slugify(this.name,{lower:true});
    next();
})


//document middleware runs before .save() and create() and not for update()
tourSchema.pre('save',function(next){
    console.log('will save this document');
    next();
})

tourSchema.post('save',function(doc,next){
    console.log(doc);
    next();
})

// query middlware 
// tourSchema.pre('find',function(next){
//     this.find({secretTour:{$ne:true}})
//     next();
// })

//insted of using separate functions for all find operators instead we use /regular expression/
tourSchema.pre(/^find/,function(next){   
    this.find({secretTour:{$ne:true}})
    this.start= Date.now();
    next();
})
tourSchema.post(/^find/,function(docs,next){   

    console.log(`query took ${Date.now()-this.start} milli seconds`)
    //console.log(docs)
   next();
})

tourSchema.pre('aggregate',function(next)
{
    this.pipeline().unshift({$match:{secretTour:{$ne:true}}})
    console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour',tourSchema);
module.exports = Tour;
 
///// for testing purposesssssssss

// const testTour = new Tour({
//     name:'forrestt gumpp112',
//     price:120
// })
 
// testTour.save().then(doc=>
//     {
//         console.log(doc)
//     })
//     .catch(err=>
//     {
//         console.log('error 😥',err);
//     })