// importing express
const express = require('express')
// importing cores
const cors = require('cors')
// importing mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// importing dotenv
require('dotenv').config()

// application port
const port = process.env.PORT || 5000
// importing express
const app = express()

// middlewares

// using cors middleware
app.use(cors())
// using express.json middleware
app.use(express.json())

// mongodb uri 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eeint.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function run() {
  try {
    // backend functionality starts here

    // creating database named jobPortalDB
    const database = client.db("jobPortalDB");
    // creating  collection named jobs
    const jobCollection = database.collection("jobs");

    // backed apis start here

    // getting all jobs from the server
    app.get('/jobs', async (req, res) => {
      const jobs = await jobCollection.find().toArray();
      res.send(jobs);
    })

    // get job by id
    app.get(`/job/:id`, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const jobs = await jobCollection.findOne(filter);
      res.send(jobs);
    })

    // update a job by id

    app.put('/update-job/:id', async (req, res) => {
      const id = req.params.id;
      const job = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: job
      };
      const result = await jobCollection.updateOne(filter, updateDoc, options);
      
      res.send(result);
    })

    // get jobs by specific email
    app.get(`/jobs/:email`, async (req, res) => {
      const email = req.params.email;
      const filter = { 'buyer.buyer_email': email };
      const result = await jobCollection.find(filter).toArray();
      res.send(result);
    })

    // adding new job to the server
    app.post('/add-job', async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      res.send(result);
    })

    // delete job by id
    app.delete('/my-posted-jobs/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const result = await jobCollection.deleteOne(filter);
      res.send(result);
    })













    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)
app.get('/', (req, res) => {
  res.send('Hello from job portal Server....')
})
app.listen(port, () => console.log(`Server running on port ${port}`))
