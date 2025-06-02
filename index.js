const express = require("express");
const bodyParser = require("body-parser");
const connectToDb = require("./config/connectToDb");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const reviewRoutes = require("./routes/review");
const orderRoutes = require("./routes/order");
const faqRoutes = require("./routes/faqs");
const graphRoutes = require("./routes/graph");
const aiRoutes = require("./routes/ai");
const http = require("http");
const { setupWebSocket } = require("./config/webSocketConfig");
const { Server } = require("socket.io");

require("dotenv").config();

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Change to your frontend domain in prod
  },
});

setupWebSocket(io); // ← Your function is used here

// ✅ Middleware first
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Then connect DB
connectToDb();

// ✅ Then register routes
app.use("/api/auth", authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/graph", graphRoutes);
app.use("/api/ai", aiRoutes);

// Test endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
