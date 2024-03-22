const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const moment = require("moment");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

const uri = process.env.uri;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    //collections
    const userCollection = client.db("QuickDrop").collection("userCollection");
    const bookingCollection = client
      .db("QuickDrop")
      .collection("bookingCollection");

    //GET API's
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    //get users role
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    //get all parcels
    app.get("/parcels/:email", async (req, res) => {
      const email = req.params.email;
      const result = await bookingCollection.find({ email }).toArray();
      res.send(result);
    });

    //PUT API's
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
      const query = { email: email };
      const options = { upsert: true };
      const isExist = await userCollection.findOne(query);
      // console.log("User found?----->", isExist);
      if (isExist) {
        if (user?.status === "Requested") {
          const result = await userCollection.updateOne(
            query,
            {
              $set: user,
            },
            options
          );
          return res.send(result);
        } else {
          return res.send(isExist);
        }
      }
      const result = await userCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: timestamp },
        },
        options
      );
      res.send(result);
    });

    //POST API's
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });

    //PATCH API's
    app.patch("/users-update/:email", async (req, res) => {
      const userEmail = req.params.email;
      const update = req.body;
      const query = {
        email : userEmail,
      };
      const updateUser = {
        $set: {
          name: update.name,
          photoURL: update.photoURL,
        },
      };
      const result = await userCollection.updateOne(query, updateUser);
      res.send(result)
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("QuickDrop server is running");
});

app.listen(port, () => {
  console.log(`QuickDrop server running port is ${port}`);
});
