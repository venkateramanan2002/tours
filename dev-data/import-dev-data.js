const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Tour = require('./../model/tourmodel')
dotenv.config({path:'./config.env'});



const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB, 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
})
.then(()=>console.log('db Connection successfull'))

//reading JSON File 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8'))

//import data to DB 
const importData = async()=>
{
    try 
    {
        await Tour.create(tours)
        console.log('Data imported Successfully')    
        process.exit()  
    }
        catch(err)
    {
        console.log(err)
    }
}

//delete all data into DB
const deleteData = async()=>
{
    try 
    {
        await Tour.deleteMany()
        console.log('Data deleted Successfully')  
        process.exit()  
    }
        catch(err)
    {
        console.log(err)
    }
}

if(process.argv[2]=='--import')
{
    importData()
}
else if(process.argv[2]=='--delete')
{
    deleteData()
}
