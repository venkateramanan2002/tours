    const express = require('express')
    const tourController= require('../controller/tourController')
    const authController = require('../controller/authController');
    const router = express.Router();
    // router.param('id',tourController.checkID)

    //ch3ck body middleware
    // router.param('/',tourController.checkBody)
    //check if the body contains name and price 

    //if not send 400 error 

    //add it to post handler stack 

    router
    .route('/top-5cheap')
    .get(tourController.aliasTopTours,tourController.getAllTours)

    router
    .route('/tour-stats').get(tourController.getTourStats)

    router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan)
    
    
      
    
    router
    .route('/')
    .get(authController.protect,tourController.getAllTours)
    .post(tourController.createTour)
    
    router
    .route('/:id') 
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)
      
   
    module.exports = router;
      