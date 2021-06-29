const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const { readdirSync } = require("fs");
require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("DB conencted");
  })
  .catch((err) => {
    console.log(`DB connection error ${err}`);
  });

app.use(bodyParser.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(cors());

readdirSync("./routes").map((r) => {
  app.use("/api", require("./routes/" + r));
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
