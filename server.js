const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//.Env files

dotenv.config();

//Mongo DB connection

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Db connection is working!"))
  .catch(error => {
    console.log("Error: ", error);
  });

// JSON

app.use(express.json());

//Models

require("./models");

//Routes

app.use("/", require("./routes"));

//APP Listen

app.listen(3001, error => {
  if (error) throw error;
  console.log(`Server is working in http://localhost:${3001}`);
});
