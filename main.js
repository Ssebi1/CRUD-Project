const express = require('express');
const app = express();
const path = require('path');
app.listen(4040);
app.set('view engine', 'ejs');
app.use(express.static('public'));
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('bson');
const { query } = require('express');


connectionString = "mongodb+srv://sebi:infoword1234@database.qq3bf.mongodb.net/Database?retryWrites=true&w=majority"
MongoClient.connect(connectionString, { useUnifiedTopology: true })
.then(client => {
    const db = client.db('Database')
    const objects = db.collection('objects')
    var query = {};
    var sort = {};

    // Display objects
    app.get('/',(req,res)=>{
        res.redirect('/dashboard');
    });
    app.get('/dashboard',(req,res)=>{
        if(req.query.sort!=undefined && req.query.sort!='oldest')
        {
            if(req.query.sort=='name-ascending')
                sort = { name : 1 };
            else if(req.query.sort=='name-descending')
                sort = { name : -1 };
            else if(req.query.sort=='price-ascending')
                sort = { price : 1 };
            else if(req.query.sort=='price-descending')
                sort = { price : -1 };
        }
        else
        {
            sort = {};
        }

        if(req.query.search!=undefined && req.query.search!='')
            {
                query = {name:{$regex:req.query.search}};
            }
        else query = {};

        
        db.collection('objects').find(query).sort(sort).toArray()
        .then(results => {
            res.render('index',{data:results,search:req.query.search,sort:req.query.sort});
        })
        .catch(error => console.error(error))
    });

    // Add object
    app.get('/add',(req,res)=>{
        res.render('add_object');
    });
    app.get('/add/submit',(req,res)=>{
        ObjectToInsert= {
            name: req.query.object_name,
            price: parseInt(req.query.object_price,10),
            quantity: req.query.object_quantity,
            description: req.query.object_description,
            comments: req.query.object_comments,
            rating: req.query.object_rating
        };
        objects.insertOne(ObjectToInsert)
        .then(result => {
            res.redirect('/');
          })
        .catch(error => console.error(error));
    });

    // Delete object
    app.get('/delete',(req,res)=>{
        objectsToDelete = req.query.id.split('|');
        for(let i=0 ;i<objectsToDelete.length;i++)
            objectsToDelete[i] = ObjectID(objectsToDelete[i]);

        objects.deleteMany({_id: { $in: objectsToDelete}})
            .then(result => {
                res.redirect('/');
            })
            .catch(error => console.error(error))
    })

    // Edit object
    app.get('/edit',(req,res)=>{
        objects.findOne({_id: ObjectID(req.query.id)})
        .then(result=>{
            res.render('edit_object',{data:result})
        })
        .catch(error => console.error(error));
    })
    app.get('/edit/submit',(req,res)=>{
        objects.findOneAndUpdate(
            {_id: ObjectID(req.query.id)},
            {
                $set: {
                  name: req.query.object_name,
                  price: req.query.object_price,
                  quantity: req.query.object_quantity,
                  description: req.query.object_description,
                  comments: req.query.object_comments,
                  rating: req.query.object_rating
                }
            },
            )
        .then(result => {
            res.redirect('/');
        })
        .catch(error => console.error(error));

    })

    // Search
    app.get('/search',(req,res)=>{
        res.redirect('/dashboard?search='+req.query.keyword+'&sort='+req.query.sort);
    })

})
.catch(error => console.error(error))


