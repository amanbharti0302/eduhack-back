const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');

const studentrouter = require('./router/studentrouter');
const profrouter = require('./router/profrouter');
const pythonrouter = require('./router/pythonrouter.js');
const courserouter = require('./router/courserouter');
const adminrouter = require('./router/adminrouter');
const textrouter = require('./router/textrouter.js');

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
app.use('/course/',courserouter);
app.use('/student/',studentrouter);
app.use('/prof/',profrouter);
app.use('/admin/',adminrouter);
app.use('/python',pythonrouter);
app.use('/text',textrouter);

app.all('*',(req,res)=>{
    res.json({
        status:"fail",
        "message":"Requested route not found"
    });
})

module.exports=app;                                                                                                