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

    const Page_size = 3;

    const page = Number(req.query.page || "0")


    
    

    var sortcost={}
    if(req.query.sort)
    {
      sortcost={cost:Number(req.query.sort)}


      db.collection('rest').find(condition).limit(Page_size).skip(Page_size*page).sort(sortcost).toArray((err,result)=>{
        if (err) throw err;


        db.collection('rest').find(condition).toArray((err,res1)=>{

          const documents = res1.length;

          var pageArray=[];
          for(var i=0;i<Math.ceil(documents/Page_size);i++)
          {
            pageArray.push(i+1);
          }

          res.json({
            current_page:Number(page)+1,
            total_pages:pageArray,
            data:result
          });

        })
        


      })
    }
    else{

      db.collection('rest').find(condition).limit(Page_size).skip(Page_size*page).toArray((err,result)=>{
        if (err) throw err;

        db.collection('rest').find(condition).toArray((err,res1)=>{

          const documents = res1.length;

          var pageArray=[];
          for(var i=0;i<Math.ceil(documents/Page_size);i++)
          {
            pageArray.push(i+1);
          }

          res.json({
            current_page:Number(page)+1,
            total_record:documents,
            total_pages:pageArray,
            data:result
          });
          
        })


      })
      
    }

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
    db.collection('orders').find({}).limit().toArray((err,result) => {
      if(err) throw err;
      res.send(result)
    })
  })


  //get user all bookings

  app.get('/orders/:name',(req,res) => {
    var name = req.params.name;
    db.collection('orders').find({name:name}).toArray((err,result) => {
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


