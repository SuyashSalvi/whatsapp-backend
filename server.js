import express from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Pusher from "pusher";
import cors from "cors"; 

//app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1675034",
    key: "51df8688c4bdfc557e31",
    secret: "8d5ca2fceeea06a24537",
    cluster: "us3",
    useTLS: true
  });

//middleware
app.use(express.json()); //for parsing json bodies in request body
app.use(cors())

app. use ((req, res, next) => {
    res. setHeader ("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","*");
    next();
})

//DB config
const config_url = 'mongodb+srv://ssalvi28:Suyash!1998@cluster0.n1biwe8.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(config_url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.once("open",()=>{
    console.log('connected to DB');

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change)=>{
        if (change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('messages', 'inserted',{
                name: messageDetails.user,
                message: messageDetails.message
        });
        }
    else {
        console. log ('Error triggering Pusher')
    }
    


    })
})

//api routes
app.get("/",(req,res)=>res.status(200).send("Hello World!"));

app.get("/messages/sync",(req,res)=>{

    Messages.find()
        .then(result => {
            res.status(200).send(result)
        })
        .catch(error => {
            res.status(500).send(error)
        });

})

app.post("/messages/new",(req,res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage)
        .then(result => {
            res.status(200).send(`New message created: ${dbMessage.message} by ${dbMessage.name}`)
        })
        .catch(error => {
            res.status(500).send(error)
        });

})

app.listen(port,()=>console.log(`Running on localhost: ${port}`));
