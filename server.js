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

// get route to pick the collection name from URL parameter (i.e lessons from http://localhost:3000/collection/lessons)
app.param("collectionName", (request, response, next, collectionName)=>{
    request.collection = db.collection(collectionName);
    return next();
});

// get route to retrieve all objects from collection
app.get("/collection/:collectionName", (request, response, next)=>{
    request.collection.find({}).toArray((e, results) => {
        if (e) return next();
        response.send(results);
    });
});

// get route for "/lessons" path that returns lessons JSON object
app.get("/lessons", (request, response, next)=>{
    const lessons = [
        {
            id: 1001,
            subject: "Artificial Intelligence",
            location: "Dubai",
            price: 4000,
            spaces: 10,
            image: "img/artificial-intelligence.png"
        },
        {
            id: 1002,
            subject: "Artificial Intelligence",
            location: "London",
            price: 5000,
            spaces: 10,
            image: "img/artificial-intelligence.png"
        },
        {
            id: 1003,
            subject: "Artificial Intelligence",
            location: "Mauritius",
            price: 3000,
            spaces: 10,
            image: "img/artificial-intelligence.png"
        },
        {
            id: 1004,
            subject: "Advanced Web Dev",
            location: "Dubai",
            price: 3000,
            spaces: 10,
            image: "img/advanced-web-development.png"
        },
        {
            id: 1005,
            subject: "Advanced Web Dev",
            location: "London",
            price: 4000,
            spaces: 10,
            image: "img/advanced-web-development.png"
        },
        {
            id: 1006,
            subject: "Advanced Web Dev",
            location: "Mauritius",
            price: 2500,
            spaces: 10,
            image: "img/advanced-web-development.png"
        },
        {
            id: 1007,
            subject: "Mobile Development",
            location: "Dubai",
            price: 6500,
            spaces: 10,
            image: "img/mobile-development.png"
        },
        {
            id: 1008,
            subject: "Mobile Development",
            location: "London",
            price: 8000,
            spaces: 10,
            image: "img/mobile-development.png"
        },
        {
            id: 1009,
            subject: "Mobile Development",
            location: "Mauritius",
            price: 5500,
            spaces: 10,
            image: "img/mobile-development.png"
        },
        {
            id: 1010,
            subject: "Big Data",
            location: "Dubai",
            price: 10000,
            spaces: 10,
            image: "img/big-data.jpg"
        }
    ];
    response.send(lessons);
});