require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(session({
  secret : "This is my preety little secret",
  resave : false,
  saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//To remove deprecative warning
mongoose.set('useCreateIndex', true);


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
//Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

//Add cookies
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", function(req, res) {
  res.render("home");
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.route("/logout")

.get(function(req, res){
  req.logout();
  res.redirect('/');
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.route("/secrets")

.get(function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }else{
    res.render("login")
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.route("/login")

  .get(function(req, res) {
    res.render("login");
  })

  .post(function(req, res) {

    const user = new User({
      username : req.body.username,
      password : req.body.password
    });

    req.login(user,function(err){
      if(err){
        console.log(err);
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets")
        });
      }
    });

  });

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


app.route("/register")

  .get(function(req, res) {
    res.render("register");
  })

  .post(function(req, res) {
    User.register({username : req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }else{
        passport.authenticate("local")(req,res,function(){
          res.redirect("/secrets");
        });
      }
    });

  });




app.listen(3000, function() {
  console.log("Server is running");
})
