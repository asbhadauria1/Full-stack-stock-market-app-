require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoute = require("./Routes/AuthRoute");
const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const User = require("./model/UserModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(bodyParser.json());
app.use(cookieParser());

// Auth routes (/auth/signup and /auth/login)
app.use("/auth", authRoute);

// Fetch holdings tailored to the logged-in user
app.get("/allHoldings", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json([]);
    const userHoldings = await HoldingsModel.find({ userEmail: email });
    res.json(userHoldings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    const allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// Fetch orders tailored to the logged-in user
app.get("/allOrders", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json([]);
    const userOrders = await OrdersModel.find({ userEmail: email });
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Place order AND update user's holdings portfolio automatically
app.post("/newOrder", async (req, res) => {
  try {
    const { name, qty, price, mode, userEmail } = req.body;
    const numQty = Number(qty);
    const numPrice = Number(price);

    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    const newOrder = new OrdersModel({
      name,
      qty: numQty,
      price: numPrice,
      mode,
      userEmail,
    });
    await newOrder.save();

    if (mode === "BUY") {
      const existingHolding = await HoldingsModel.findOne({ name, userEmail });
      if (existingHolding) {
        const totalCost =
          existingHolding.avg * existingHolding.qty + numPrice * numQty;
        const totalQty = existingHolding.qty + numQty;
        existingHolding.avg = totalCost / totalQty;
        existingHolding.qty = totalQty;
        existingHolding.price = numPrice;
        await existingHolding.save();
      } else {
        await HoldingsModel.create({
          name,
          qty: numQty,
          avg: numPrice,
          price: numPrice,
          net: "+0.00%",
          day: "+0.00%",
          isLoss: false,
          userEmail,
        });
      }
    }

    res.status(201).send("Order saved and holdings updated!");
  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// Optional: Seed starter holdings for a specific user via /seedData?email=you@gmail.com
app.get("/seedData", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .send("Please pass ?email=your@email.com in the URL");
    }

    const existing = await HoldingsModel.countDocuments({ userEmail: email });
    if (existing > 0) {
      return res.send(`Holdings already seeded for ${email}!`);
    }

    const sampleHoldings = [
      {
        name: "BHARTIARTL",
        qty: 2,
        avg: 538.05,
        price: 541.15,
        net: "+0.58%",
        day: "+2.99%",
        userEmail: email,
      },
      {
        name: "HDFCBANK",
        qty: 2,
        avg: 1383.4,
        price: 1522.35,
        net: "+10.04%",
        day: "+0.11%",
        userEmail: email,
      },
      {
        name: "INFY",
        qty: 1,
        avg: 1350.5,
        price: 1555.45,
        net: "+15.18%",
        day: "-1.60%",
        isLoss: true,
        userEmail: email,
      },
      {
        name: "RELIANCE",
        qty: 1,
        avg: 2193.7,
        price: 2112.4,
        net: "-3.71%",
        day: "+1.44%",
        userEmail: email,
      },
      {
        name: "TCS",
        qty: 1,
        avg: 3041.7,
        price: 3194.8,
        net: "+5.03%",
        day: "-0.25%",
        isLoss: true,
        userEmail: email,
      },
    ];

    await HoldingsModel.insertMany(sampleHoldings);
    res.send(`Sample holdings seeded successfully for ${email}!`);
  } catch (error) {
    console.error("Error seeding data:", error);
    res.status(500).json({ error: "Failed to seed data" });
  }
});

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne();
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.use(express.static(path.join(__dirname, "../dashboard/build")));
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/build", "index.html"));
});

mongoose
  .connect(uri)
  .then(() => {
    console.log("DB connected!");
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
