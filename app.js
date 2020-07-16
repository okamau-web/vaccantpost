const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const app = express();

const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const indexRouter = require("./routes/index");
const employerRouter = require("./routes/employers");
const jobRouter = require("./routes/jobs");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

//load config
dotenv.config({ path: "./config/config.env" });

//connect to db
connectDB();

const PORT = process.env.PORT || 3000;
//connect to routes
app.use("/", indexRouter);
app.use("/employers", employerRouter);
app.use("/jobs", jobRouter);

app.listen(
  PORT,
  console.log(`Server running on ${process.env.NODE_ENV} mode on port ${PORT}`)
);
