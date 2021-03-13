require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", function(req, res) {
  res.render("home");
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function(req, res) {

    User.findOne({
      email: req.body.username,
    }, function(err, foundUser) {
      if (!err) {
        if (foundUser.password === md5(req.body.password)) {
          res.render("secrets");
        } else {
          console.log("Wrong password");
        }
      } else {
        console.log(err);
      }
    })

  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.route("/register")

  .get(function(req, res) {
    res.render("register");
  })

  .post(function(req, res) {

    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password)
    });

    newUser.save(function(err) {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });




app.listen(3000, function() {
  console.log("Server is running");
})
