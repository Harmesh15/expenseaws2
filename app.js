require("dotenv").config();
const path = require("path");
const fs = require("fs");
const https = require("https");
const axios = require("axios");

const express = require("express");
const db = require("./utils/db-connection");
const expenseRoute = require("./routes/expenseRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/PaymentRoutes");
const forgotPassRoute = require("./routes/forgotRoute");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");


const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" },
);

const app = express();
const cors = require("cors");

// models
require("./models");
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: false,
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"],
//         connectSrc: ["'self'", "http://localhost:8000"],
//         imgSrc: ["'self'", "data:"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//       },
//     },
//   })
// );

app.use(express.json());
app.use(cors());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));


app.use(express.static("public"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home', 'index.html'));

});

// routes
app.use("/user", userRoutes);
app.use("/expense", expenseRoute);
app.use("/password", forgotPassRoute);
app.use("/payment", paymentRoutes);


const PORT = process.env.PORT || 3000;

db.sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
      console.log("DB_HOST from ENV:", process.env.DB_HOST)
    });
  })
  .catch((error) => {
    console.log(error.message);
  });



// const express = require("express");
// const db  = require("./utils/db-connection");
// const userRoute = require("./routes/userRoutes");
// const cors = require('cors');
// const app = express();


// // models
// require("./models/expensemodel");


// app.use(express.json());
// app.use(cors());
// app.use(express.static('public'));

// app.get("/",(req,res)=>{
//     res.send("hello from the server");
// })

// app.use("/user",userRoute);


// db.sync().then(()=>{
//     app.listen(3000,()=>{
//     console.log("server is running");
// })
// })
