const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Create the Express app
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Connect to MongoDB
const MongoDB_USERID = "vikashbbr";
const MONGODB_PASSWORD = `Civil9005`;
const MONGODBURI = `mongodb+srv://${MongoDB_USERID}:${MONGODB_PASSWORD}@cluster0.9o6eros.mongodb.net/food_items?retryWrites=true&w=majority`;
mongoose.connect(MONGODBURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to the database");
});

// Define the data model/schema
const itemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  image: String,
  category: String,
  label: String,
  price: Number,
  description: String,
});

// Create the Item model
const Item = mongoose.model("Item", itemSchema);

// Fetch all items
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find({});
    return res.json(items);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
});

// Update item price
app.put("/api/items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    const item = await Item.findOneAndUpdate({ id }, { price }, { new: true });
    if (!item) {
      return res.status(404).json({
        error: "Item not found",
      });
    }
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
});

app.put("/api/items", async (req, res) => {
  const updateditems = req.body;

  for (const singleItem of updateditems) {
    const id = Number(singleItem.id);
    const foodItem = await Item.findOne({ id: id });

    if (!foodItem) {
      res.status(404).json({
        message: "Food item not found",
      });
      return;
    }

    if (String(foodItem.price) !== String(singleItem.price)) {
      foodItem.price = singleItem.price;
    }
    await foodItem.save();
  }

  res.status(200).json({
    message: "Food item prices updated successfully",
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
