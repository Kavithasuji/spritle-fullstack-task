const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const webhookRoutes = require('./routes/webhook.routes');


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));


app.use("/api/integrations", require("./routes/integration"));
app.use('/api/webhook', webhookRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));