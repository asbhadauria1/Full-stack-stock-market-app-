const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  price: Number,
  mode: String,
  userEmail: { type: String, required: true },
});

module.exports = { OrdersSchema };
