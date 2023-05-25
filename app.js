const express = require('express');
const app = express();
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const AppError = require('./utils/appError')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const globalErrorHandler = require('./controller/errorController')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')

//global middleware
//security http headers 
app.use(helmet());
//development logging 
if(process.env.NODE_ENV==='development')
{
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    max:100,
    windowMs:60*60*1000,
    message:'too many requests from this IP please try again after some time '
})
app.use('/api',limiter)

//data sanitization againt NOSQL query injection 
app.use(mongoSanitize)

//data sanitization againt xss 
app.use(xss())

//prevent parameter pollution
app.use(hpp({whitelist:['duration','sort']}))

// app.get('/',(req,res)=>
// {
//     res.status(200)
//     //.send('this is from server side.. both are same)
//     .json({
//         message:'this is from server'
//     });

// })

// app.post('/',(req,res)=>
// {
//     res.json({message:'you can post this endpoint'});
// })

//for using middleware for post req method 
//body parser reading data from body into req.body 
app.use(express.json({limit:'10kb'}))

app.use(morgan('dev'))
//serving static files
app.use(express.static(`${__dirname}/public`))
//test middleware 
app.use((req,res,next)=>
{
    console.log('this is from middleware');
    next()
})

app.use((req,res,next)=>
{
    req.requestTime = new Date().toLocaleDateString();
    console.log(req.headers);
    
    next()
})





// app.get('/api/v1/tours',(req,res)=>{
    //     res.status(200)
    //     .json({status:"success",
    //     results:tours.length,
    //         tours});
    // })
    
    
    //route handlers 
    
    
    // app.get('/api/v1/tours',getAllTours);
    // app.delete('/api/v1/tours',deleteTours);
    // app.post('/api/v1/tour',createTour);
    // app.patch('/api/v1/tour/:id',updateTour);
    // app.get('/api/v1/tour/:id',getTour);
    
    
    //routes 
    //tourRouter.route('/api/v1/tours').get(getAllTours).post(createTour).delete(deleteTours)
   
    app.use('/api/v1/user',userRouter)
    app.use('/api/v1/tours',tourRouter)
    
    // Add this route handler at the end of your routes

app.all('*', (req, res, next) => {
    const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(error);
  });

  
    
    app.use(globalErrorHandler);
    module.exports = app;
