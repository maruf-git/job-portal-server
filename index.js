// importing express
const express = require('express')
// importing cores
const cors = require('cors')
// importing mongodb
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
// importing dotenv
require('dotenv').config()
// jwt
const jwt = require('jsonwebtoken')

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

    // jwt
    // app.post('/jwt',async(res,res)=>{
    //   const email = req.body;

    //   create token
    //   jwt.sign(email,)

    // })




    // creating database named jobPortalDB
    const database = client.db("jobPortalDB");
    // creating  collection named jobs
    const jobCollection = database.collection("jobs");

    // creating collection named bids
    const bidCollection = database.collection("bids");

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


    // bid related apis here

    // adding new bid to the bid collection
    app.post("/add-bid", async (req, res) => {
      const bid = req.body;
      // check if the user already placed bid for this job
      const query = { 'bidder.email': bid.bidder.email, job_id: bid.job_id }
      const alreadyExist = await bidCollection.findOne(query);
      console.log("if already exist--->", alreadyExist);
      if (alreadyExist) return res.status(400).send('You have already placed a bid on this job');

      // save data in bid collection
      const result = await bidCollection.insertOne(bid);

      // update bid count in job collection
      const filter = { _id: new ObjectId(bid.job_id) };
      const update = {
        $inc: { bid_count: 1 }
      }
      const updatedBidCount = await jobCollection.updateOne(filter, update);

      res.send(result);
    })

    // get all bids of an user
    app.get('/bids/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { 'bidder.email': email };
      const result = await bidCollection.find(filter).toArray();
      res.send(result);
    })

    // get all bid-request of an user
    app.get('/bid-requests/:email', async (req, res) => {
      const email = req.params.email;
      const filter = { buyer_email: email };
      const result = await bidCollection.find(filter).toArray();
      res.send(result);
    })

    app.patch('/bid-requests-status-update/:id', async (req, res) => {
      const id = req.params.id;
      const {status} = req.body;
      const update = {
        $set: {
          status:status
        }
      }
      // console.log(id)
      // console.log(status)
      const filter = { _id: new ObjectId(id) };
      const result = await bidCollection.updateOne(filter, update)
      console.log(result)
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
