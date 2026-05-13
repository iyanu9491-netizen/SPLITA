const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGODB_URI2)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((error) => {
    console.log("Unable to connect:", error.message);
  });
