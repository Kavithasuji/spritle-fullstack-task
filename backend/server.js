const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const webhookRoutes = require("./routes/webhook.routes");

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/integrations", require("./routes/integration"));
app.use("/api/webhook", webhookRoutes);

// Health check (optional but useful)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Port (IMPORTANT for Render)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});