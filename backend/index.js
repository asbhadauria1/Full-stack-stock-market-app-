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

// Allowed explicit origins + automatic support for any Vercel preview/production subdomain
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl, or server-to-server)
      if (!origin) return callback(null, true);

      // Allow if it's in the explicit list OR ends with .vercel.app
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

app.get("/allHoldings", async (req, res) => {
  try {
    let allHoldings = await HoldingsModel.find({});
    res.json(allHoldings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

app.get("/allPositions", async (req, res) => {
  try {
    let allPositions = await PositionsModel.find({});
    res.json(allPositions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

app.get("/allOrders", async (req, res) => {
  try {
    const allOrders = await OrdersModel.find({});
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/newOrder", async (req, res) => {
  try {
    let newOrder = new OrdersModel({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });

    await newOrder.save();
    res.status(201).send("Order saved!");
  } catch (error) {
    res.status(500).json({ error: "Failed to save order" });
  }
});

// One-time route to populate initial holdings & positions into MongoDB
app.get("/seedData", async (req, res) => {
  try {
    const existingHoldings = await HoldingsModel.countDocuments();
    if (existingHoldings === 0) {
      const sampleHoldings = [
        {
          name: "BHARTIARTL",
          qty: 2,
          avg: 538.05,
          price: 541.15,
          net: "+0.58%",
          day: "+2.99%",
        },
        {
          name: "HDFCBANK",
          qty: 2,
          avg: 1383.4,
          price: 1522.35,
          net: "+10.04%",
          day: "+0.11%",
        },
        {
          name: "HINDUNILVR",
          qty: 1,
          avg: 2335.85,
          price: 2417.4,
          net: "+3.49%",
          day: "+0.21%",
        },
        {
          name: "INFY",
          qty: 1,
          avg: 1350.5,
          price: 1555.45,
          net: "+15.18%",
          day: "-1.60%",
          isLoss: true,
        },
        {
          name: "KPITTECH",
          qty: 5,
          avg: 250.3,
          price: 266.45,
          net: "+6.45%",
          day: "+3.54%",
        },
        {
          name: "M&M",
          qty: 2,
          avg: 809.9,
          price: 779.8,
          net: "-3.72%",
          day: "-0.01%",
          isLoss: true,
        },
        {
          name: "RELIANCE",
          qty: 1,
          avg: 2193.7,
          price: 2112.4,
          net: "-3.71%",
          day: "+1.44%",
        },
        {
          name: "SBIN",
          qty: 4,
          avg: 324.35,
          price: 430.2,
          net: "+32.63%",
          day: "-0.34%",
          isLoss: true,
        },
        {
          name: "TCS",
          qty: 1,
          avg: 3041.7,
          price: 3194.8,
          net: "+5.03%",
          day: "-0.25%",
          isLoss: true,
        },
        {
          name: "WIPRO",
          qty: 4,
          avg: 489.3,
          price: 577.75,
          net: "+18.08%",
          day: "+0.32%",
        },
      ];
      await HoldingsModel.insertMany(sampleHoldings);
    }

    const existingPositions = await PositionsModel.countDocuments();
    if (existingPositions === 0) {
      const samplePositions = [
        {
          product: "CNC",
          name: "EVEREADY",
          qty: 2,
          avg: 316.27,
          price: 312.35,
          net: "+0.58%",
          day: "-1.24%",
          isLoss: true,
        },
        {
          product: "CNC",
          name: "JUBLFOOD",
          qty: 1,
          avg: 3124.75,
          price: 3082.65,
          net: "+10.04%",
          day: "-1.35%",
          isLoss: true,
        },
      ];
      await PositionsModel.insertMany(samplePositions);
    }

    res.send("Sample holdings and positions seeded successfully!");
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

// Optional: Only serve local dashboard build if it exists
app.use(express.static(path.join(__dirname, "../dashboard/build")));
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../dashboard/build", "index.html"));
});

// Connect to MongoDB first, then start the server
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
