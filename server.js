const express = require("express");
const cors = require("cors");
const dbConfig = require("./config/db.config");
require("dotenv").config();

const app = express();
var corsOptions = {
  origin: "http://localhost:9091",
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require("./models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Tethered to MongoDB, bruh!");
    // creates 3 rows in Roles collection
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });


// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);



app.listen(process.env.PORT, () => {
  console.log(`Bruh! ${process.env.PORT}`);
});





// intial
const initial = () => {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((error) => {
        if (err) console.log("Error: ", error);
        console.log("Added 'user' to roles collection");
      });

      // Moderator role
      new Role({
        name: "moderator",
      }).save((error) => {
        if (error) console.log("Error: ", error);
        console.log("Added 'moderator' to roles collection");
      });

      // admin role
      new Role({
        name: "admin",
      }).save((error) => {
        if (error) console.log("Error: ", error);
        console.log("Added 'admin' to roles collection");
      });
    }
  });
};
