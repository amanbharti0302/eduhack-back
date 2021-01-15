const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');

const app=express();
app.enable('trust proxy');
app.use(cors());
app.options('*', cors());


app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.static("public"));
app.use(express.json());
app.use(bodyparser.json({type: 'application/*+json' }));

app.get('/',(req,res)=>{
    res.json({
        status:"success",
        messge:"Welcome"
    })
})

app.all('*',(req,res)=>{
    res.json({
        status:"fail",
        "message":"Requested route not found"
    });
})

module.exports=app;                                                                                                