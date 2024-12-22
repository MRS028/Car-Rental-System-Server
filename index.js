const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Your favourite Car is waiting for you...");
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3w3t.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  
  //CarCollection in database 

  const carsCollection = client.db("CarHub").collection("cars");


  //jwt token related APi


  //car post related APi
app.post('/cars',async(req,res)=>{
  const newCar = req.body;
  const result = await carsCollection.insertOne(newCar);
  res.send(result);
});

app.get('/allCars',async(req,res)=>{
  const cursor = carsCollection.find();
  const result = await cursor.toArray();
  res.send(result);
})


  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
  }
}

run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Car is waiting at: ${port}`);
});
