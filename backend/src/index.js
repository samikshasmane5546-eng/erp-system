const productsRouter = require("./products");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const enquiriesRouter = require("./enquiries");
const quotationsRouter = require("./quotations");
const salesOrdersRouter = require("./salesOrders");


const { router: authRouter } = require("./auth");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "ERP System API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
  });
});

app.use("/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/enquiries", enquiriesRouter);
app.use("/api/quotations", quotationsRouter);
app.use("/api/sales-orders", salesOrdersRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});