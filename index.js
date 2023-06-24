const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hryqmnq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {serverApi: {version: ServerApiVersion.v1,strict: true,deprecationErrors: true,}});

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({message:"unauthorized access"})
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded){
        if (err) {
            return res.status(401).send({message:"unauthorized access"})
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
    try {
        const servicesCollection = client.db("geniusCar").collection("services")
        const orderCollection = client.db("geniusCar").collection("orders");


        app.post("/", (req, res) => {
            console.log("Amirul Islam")
            res.send("Genius car server is running");
        })


        app.post("/jwt", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn:"1h"
            })
            res.send({token});
            console.log(user);
        })


        app.get("/services", async(req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query)
            const services = await cursor.toArray()
            res.send(services);
        })


        app.get("/services/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const service = await servicesCollection.findOne(query)
            res.send(service);
        })


        app.post("/orders", verifyJWT, async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })
        
        app.get("/orders", verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({message:"unauthorized access"})
            }
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            // console.log(query)
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        })


        app.patch("/orders/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status:status
                }
            }
            const result = await orderCollection.updateOne(query, updatedDoc)
            res.send(result);
        })


        app.delete("/orders/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {
        
    }
}
run().catch(error => console.log(error));




app.listen(port, () => {
    console.log(`Genius Car Server Running On Port ${port}`)
})



// User Name: GeniusCarDbUser
// Password:qMPEoAwlcOW18fbh