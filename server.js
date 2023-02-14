// import express node module
const express = require("express");
// import client from mongodb node module
const MongoClient = require("mongodb").MongoClient;

// instantiate express as app
const app = express();

// express configuration to extract parameters from the requests
app.use(express.json());

// start express server on port 3000 and print message to console
app.listen(3000, ()=>{
    console.log("App started on 3000 ");
});

// connection string to remote mongodb database
MongoClient.connect("mongodb+srv://joanpatience:Admin123@cluster0.05qbvez.mongodb.net", (error, client) => {
    db = client.db("webstore");
});

// route for "/" path that returns index.html
app.use(express.static("./"));

// get route to pick the collection name from URL parameter (e.g lessons from http://localhost:3000/collection/lessons)
app.param("collectionName", (request, response, next, collectionName)=>{
    request.collection = db.collection(collectionName);
    return next();
});

// get route to retrieve all objects from collection (used for endpoint http://localhost:3000/collection/lessons)
app.get("/collection/:collectionName", (request, response, next)=>{
    request.collection.find({}).toArray((e, results) => {
        if (e) return next();
        response.send(results);
    });
});

// post route to add orders into mongodb collection (used for endpoint http://localhost:3000/collection/orders)
// NB: use insertOne to enter one item to the db at a time or insertMany to enter multiple items to the db at once
app.post("/collection/:collectionName" , (request, response, next)=>{
    request.collection.insertMany(request.body, (e, results) => {
        if (e) return next(e);
        response.send(results.ops);
    });
});

// put route to edit lesson spaces for ordered item IDs in the cart (used for endpoint http://localhost:3000/collection/lessons/update)
app.put("/collection/:collectionName/update", (request, response, next)=>{
    orderedItems = request.body;
    orderedItems.forEach(item => {
        request.collection.updateOne(
            {id: item}, // specify which document to update based on itemID
            {$inc: { spaces: -1 }}, // the $inc operator increments the spaces field by -1
            {safe: true, multi: false}
        );
    });
});
