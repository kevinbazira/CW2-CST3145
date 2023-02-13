// import express node module
const express = require("express");

// instantiate express as app
const app = express();

// start express server on port 3000 and print message to console
app.listen(3000, ()=>{
    console.log("App started on 3000 ");
});