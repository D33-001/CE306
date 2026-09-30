require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error);
  });

// Middleware
app.use(express.json());

// Schema
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
});

// Model
const Product = mongoose.model("Product", ProductSchema);

// Escape special RegExp characters so the keyword is treated as normal text.
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Create
app.post("/products", async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Read All
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Search by product name (case-insensitive)
app.get("/products/search/:keyword", async (req, res) => {
  try {
    const products = await Product.find({
      name: {
        $regex: escapeRegExp(req.params.keyword),
        $options: "i",
      },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Filter by category
app.get("/products/category/:category", async (req, res) => {
  try {
    const products = await Product.find({
      category: req.params.category,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Show only products that are in stock
app.get("/products/available", async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $gt: 0 },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Add stock
app.patch("/products/:id/add-stock", async (req, res) => {
  try {
    const { amount } = req.body;

    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "amount must be a number greater than 0",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { stock: amount } },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Read Single
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update
app.patch("/products/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// Delete
app.delete("/products/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
