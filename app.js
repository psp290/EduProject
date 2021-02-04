const express = require('express');
const mongo = require('mongodb');

const MongoClient = mongo.MongoClient;
const app = express();
const port = process.env.PORT || 9900;
const cors = require('cors');
const bodyParser = require('body-parser');


let a;
const url = 'mongodb+srv://pratik:pratik@cluster0.996mo.mongodb.net/eduNovIntern?retryWrites=true&w=majority';
let db ;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());





app.get('/',(req,res)=>{
    res.status(200).send('Health Ok');
});


// get city (Sort and Pagination)
app.get('/city',(req,res)=>{
    let sortcondition = {city_name:1};

    let limit =100
    if(req.query.sort && req.query.limit ){
      sortcondition = {city_name:Number(req.query.sort)};
      limit =Number(req.query.limit)
    }
    else if(req.query.sort){
      sortcondition = {city_name:Number(req.query.sort)}
    }else if(req.query.limit){
      limit =Number(req.query.limit)
    }


    db.collection('city').find().sort(sortcondition).limit(limit).toArray((err,result)=>{
        res.send(result);
    });
});

app.get('/meal',(req,res)=>{

  db.collection('mealType').find().toArray((err,result)=>{
    if(err) throw err;

    res.json(result);
  })
})


// get Restaurant (Filter)
app.get('/rest',(req,res)=>{
    let condition ={};
    //meal +cost
    if(req.query.mealtype && req.query.lcost && req.query.hcost){
        condition={$and:[{"type.mealtype":req.query.mealtype},{cost:{$lt:Number(req.query.hcost),$gt:Number(req.query.lcost)}}]}
    }
    //meal + city
    else if(req.query.mealtype && req.query.city){
        condition={$and:[{"type.mealtype":req.query.mealtype},{city:req.query.city}]}
    }
    //meal + cuisine
    else if(req.query.mealtype && req.query.cuisine){
        condition={$and:[{"type.mealtype":req.query.mealtype},{"Cuisine.cuisine":req.query.cuisine}]}
    }
      //meal
    else if(req.query.mealtype){
        condition={"type.mealtype":req.query.mealtype}
    }
      //city
    else if(req.query.city){
        condition={city:req.query.city}
    }

    db.collection('rest').find(condition).toArray((err,result)=>{
        if (err) throw err;

        res.send(result);
    })
    
});


//placeorder
app.post('/placeorder',(req,res)=>{
    db.collection('orders').insert(req.body,(err,result) => {
      if(err) throw err;
      res.send('data added');
    })
  })
  
  //get all bookings
  app.get('/orders',(req,res) => {
    db.collection('orders').find({}).toArray((err,result) => {
      if(err) throw err;
      res.send(result)
    })
  })


//rest details
app.get('/rest/:id',(req,res) =>{
  var id = req.params.id
  db.collection('rest').find({_id:id}).toArray((err,result) => {
    if(err) throw err;
    res.send(result)
  })
})




//insert Restaurant
app.post('/insertRest',(req,res)=>{
    db.collection('rest').insertMany(req.body,(err,result)=>{
        if(err) throw err;
        res.send('data added');
    });
});


//insert City
app.post('/insertCity',(req,res)=>{
    db.collection('city').insertMany(req.body,(err,result)=>{
        if(err) throw err;
        res.send('City added');
    });
})





MongoClient.connect(url,(err,conn)=>{

    if(err) throw err;
    db = conn.db('eduNovIntern');
    
    app.listen(port,(err,result)=>{
        if(err) throw err;
    
        console.log(`Running on port ${port}`);
    });

})


