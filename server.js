// import express node module
const express = require("express");
// import file system (i.e fs) node module
const fs = require("fs");
// import client from mongodb node module
const MongoClient = require("mongodb").MongoClient;
// import path node module
const path = require("path");

// import dotenv node module
const dotenv = require("dotenv");
dotenv.config();

// instantiate express as app
const app = express();

// enable CORS so that different domains can access files/resources on this server
app.use((request, response, next)=>{
    response.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// express configuration to extract parameters from the requests
app.use(express.json());

// start express server on port 3000 or port that heroku dinamicaly sets and print message to console
app.listen(process.env.PORT || 3000, ()=>{
    console.log("App started on 3000 OR " + process.env.PORT);
});

// a ‘logger’ middleware that outputs all requests to the server console
app.use((request, response, next)=>{
    console.log("[LOGGER] Request URL: " + request.url);
    return next();
});

// connection string to remote mongodb database
MongoClient.connect("mongodb+srv://" + process.env.REMOTE_MONGODB_CREDENTIALS + "@cluster0.05qbvez.mongodb.net", (error, client) => {
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
    if (e) return next(e);
    response.send(results);
});

// get route to search lessons from db collection (used for endpoint http://localhost:3000/collection/lessons/dev/price/descending)
app.get("/collection/:collectionName/:searchTerm/:sortAspect/:sortAscDesc", (request, response, next) => {
    // TODO: Validate params
    let searchTerm = request.params.searchTerm;
    let sortAspect = request.params.sortAspect;
    let sortDirection = 1;
    if (request.params.sortAscDesc === "descending") {
        sortDirection = -1;
    }
    request.collection.find(
        {$or:[ // find documents where subject OR location includes search term
            { subject: { $regex: searchTerm, $options: "si" } }, // i === case-insenitive, s === zero or more occurrence of whitespace characters
            { location: { $regex: searchTerm, $options: "si" } }
        ]},
        { // sort search based on sortAspect and sortDirection
            sort: [[sortAspect, sortDirection]]
        }).toArray((e, results) => {
        if (e) {
            return next(e);
        }
        response.send(results);
    });
});

// static file middleware that returns lesson images, or an error message if the image file does not exist. NB: should be the last middleware OTW it causes interruptions.
app.use((request, response, next)=>{
    const filePath = path.join(__dirname, "img", request.url); // the static folder is named "img"
    fs.stat(filePath, (error, fileInfo)=>{
        if(error){
            response.send("Error 404 : Oops! Requested file doesn't exist. Please check file name.");
            return;
        }

        if(fileInfo.isFile()){
            response.sendFile(filePath);
        } else {
            next();
        }
    });
});
