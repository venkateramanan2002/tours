const mongoose = require('mongoose')
const Tour = require('../model/tourmodel')

const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync')
exports.aliasTopTours = (req,res,next) =>
{
    req.query.sort = 'price,-ratingsAverage';
    req.query.limit = '5';
    req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
    next();
}

class APIFeatures 
{
    constructor(query,queryStr)
    {
        this.query = query;
        this.queryStr = queryStr;
    }
    filter()
    {
        const queryObj = {...this.queryStr};
        const excludedFeilds = ['page','sort','limit','fields']

        //to delete other feilds comes in query 
        excludedFeilds.forEach(el=>delete queryObj[el])
        console.log(this.queryStr)

        //{difficulty:'easy',duration:{$gte:5}}
        //{difficulty: 'easy', duration: { gte: '5' } }

        //gte,gt,lte,lt
        //1 advanced filtering
        let queryStr = JSON.stringify(queryObj)       
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);
        console.log(JSON.parse(queryStr))

        this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort()
    {
        if(this.queryStr.sort)
        {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            console.log(sortBy)
        }
        else 
        {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    limitfields()
    {
        
        if(this.queryStr.fields)
        {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else
        {
            this.query = this.query.select('-__v')
        }
        
     return this;
    }

    paginate()
    {
        const page = this.query.page*1 || 1;
        const limit = this.queryStr.limit *1 || 100;
        const skip = (page-1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}


//importing data from our local fileee   
//const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/tours-simple.json`))

//middleware 
// exports.checkID = (req,res,next,val)=>
// {
//     console.log(`tour id is ${val}`)
//     if(req.params.id*1>tours.length)
//     {
//         return res.status(404)
//         .json({
//             status:"fail",message:"invalid Id"
//              });
//     }
//     next();
// }



//////now our mongoose model will gonna take care of this 
// exports.checkBody =(req,res,next)=>
// {
//     if(!req.body.name || !req.body.price)
//     {
//         return res.status(400)
//         .json(
//             {
//                 status:"failure",
//                 message:'check name and price details'
//             }
//         )
//     }
//     next();
// }

//build query 

// let query = Tour.find(JSON.parse(queryStr));

        //2 sorting 
        // if(req.query.sort)
        // {
            //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy)
        //     query = query.sort(req.query.sort.split(',').join(' '));
        // }
        // else 
        // {
            //     query = query.sort('-createdAt');
            // }
            //3 field limiting 
            
            // if(req.query.fields)
            // {
                //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }
        // else
        // {
            //     query = query.select('-__v')
        // }
        
        // //pagination
        // const page = req.query.page*1 || 1;
        // const limit = req.query.limit *1 || 100;
        // const skip = (page-1) * limit;
        // query = query.skip(skip).limit(limit);
        
        // if(req.query.page)
        // {
            //     const numTours = await Tour.countDocuments();
            //     if(skip>=numTours) throw new Error("this page doesn't have ")
            // }
            
            exports.getAllTours = catchAsync(async(req,res)=>{
                // const tour = await Tour.
                //execute query
                const features = new APIFeatures(Tour.find(),req.query).filter().sort().limitfields().paginate(); 
                const tours = await features.query;
                
                //send response 
        res.status(200)
        .json({
            status:"success", 
            requestedAt:req.requestTime,
            results:tours.length,
            message:tours})});
    //         try 
    //         {
        
    // });//tours 
    // }
    // catch(err)
    // {
    //     res.status(400)
    //     .json({
    //         status:"fail",
    //         message:err.message
    //     })
    // }
    // results:tours.length,
    // tours:tours

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
        status: 'success',
        requestedAt: req.requestTime,
        tours: newTour,
    });
});

//     const newId = tours[tours.length-1].id+1;
//     const newTours = Object.assign({id:newId},req.body);
    
//    tours.push(newTours)
   
//    fs.writeFile(`${__dirname}/../dev-data/tours-simple.json`,
//     JSON.stringify(tours),
//     err=>{

// try
// {
   
//     }
//     catch(err)
//     {
//         res.status(400)
//         .json({
            
//             status:'fail',
//             message:err.message
//         })
//     }
//         // })
//     })

exports.getTour = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid tour ID', 400));
    }
  
    const tour = await Tour.findById(id);
  
    if (!tour) {
      return next(new AppError('No tour found with that id', 404));
    }
  
    res.status(200).json({
      status: 'success',
      requestedAt: Date.now(),
      tour
    });
  });
  
    // const tour = tours.find(el=>el.id === id)
    // //if(id>tours.length)

    // res.status(200)
    // .json({status:"success",
    // tour
    // });

exports.updateTour = catchAsync(async(req,res)=>
{
 
        const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,
            {
            new:true,
            runValidators:true
            });
            
    if (!tour) {
        return next(new AppError('No tour found with that id', 404));
    }

        res.status(200)
        .json({
        status:"success",
        data:
            {
                tour
            }
        })
    })
    exports.deleteTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
          return next(new AppError('No tour found with that id', 404));
        }

        res.status(204).json({
          status: 'success',
          data: 'deleted successfully'
        });
      });
      
exports.getTourStats = catchAsync(async(req,res) =>
{
   
        const stats = await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    _id:{$toUpper:'$difficulty'},
                    numTours:{$sum:1},
                    numRating:{$sum:'$ratingsQuantity'},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:"$price"},
                    minPrice:{$min:"$price"},
                    maxPrice:{$max:"$price"}
                }
            },
            {
                $sort:{avgPrice:1}
            },
            // {
            //     $match:
            //     {
            //         _id:{$ne:'EASY'}//will remove all easy ones 
            //     }
            // }
        ]);
        res.status(200)
        .json({
        status:"success",
        data:
            {
                stats
            }
        })
    })

exports.getMonthlyPlan = catchAsync(async (req, res) => {
   
      const year = req.params.year * 1;
  
      const plan = await Tour.aggregate([
        {
          $unwind: "$startDates",
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
              _id: { $month: "$startDates" },
              numTourStarts: { $sum: 1 },
              tours: { $push: "$name" },
          },
        },
        {
          $addFields: {
            month: "$_id",
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
            $sort:
            {
                numTourStarts:-1
            }
        },
        {
            $limit:12
        }
      ]);
  
      res.status(200).json({
        status: "success",
        data: {
          plan,
        },
      });
    });
  