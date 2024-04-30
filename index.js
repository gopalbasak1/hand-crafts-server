const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qhiqbma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const productsDB = client.db("handleCraft").collection("products");
    const categoryDB = client.db("handleCraft").collection("categories");
    const cartDB = client.db("handleCraft").collection("cart");

    app.get("/", async (req, res) => {
      res.send("Server Running");
    });

    app.get("/products", async (req, res) => {
      const cursor = productsDB.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const products = req.body;
      const result = await productsDB.insertOne(products);
      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsDB.findOne(query);
      res.send(result);
    });

    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const newProductData = {
        $set: {
          name: updateProduct.name,
          category: updateProduct.category,
          time: updateProduct.time,
          price: updateProduct.price,
          rating: updateProduct.rating,
          description: updateProduct.description,
          photoUrl: updateProduct.photoUrl,
          stock: updateProduct.stock,
          customization: updateProduct.customization
        },
      };

      const result = await productsDB.updateOne(
        filter,
        newProductData,
        options
      );
      res.send(result);
    });

    app.delete("/myProducts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsDB.deleteOne(query);
      res.send(result);
    });
    
    app.get("/myProducts/:email", async(req, res) =>{
      const userEmail = req.params.email;
      const result = await productsDB.find({ email: userEmail }).toArray();
        res.send(result);
    });

    app.get("/categories/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const cursor = productsDB.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    


    app.get("/categories", async (req, res) => {
      const cursor = categoryDB.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/categories/:name", async (req, res) => {
      const categoryName = req.params.name;
      const query = { brand: categoryName }; // Assuming 'brand' is a field in your products collection
      const cursor = productsDB.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    

    app.get("/cart", async (req, res) => {
      const cursor = cartDB.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const products = req.body;
      const result = await cartDB.insertOne(products);
      res.send(result);
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      // const query = { _id: new ObjectId(id) };
      const query = { _id: id };
      const result = await cartDB.deleteOne(query);
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hand Crafts making server is running')
});

app.listen(port, () => {
    console.log(`Hand Crafts is running on port: ${port}`);
});