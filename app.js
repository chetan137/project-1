if(process.env.NODE_ENV !="production"){
  require("dotenv").config();

}
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const listingsRoutes = require("./routes/listings");



const app = express();
const ejsMate = require("ejs-mate");
const methodOverride =require("method-override");
const bodyParser = require('body-parser');
const passport = require("passport");
const LocalStrategy =require("passport-local");
const User = require("./models/user.js");

const path =require("path");

module.exports = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};





// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key', // Change this to a secure key
    resave: false,
    saveUninitialized: true,
}));
app.use(flash());

// Setting up view engine and static files (if applicable)

app.set('view engine', 'ejs');



app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended :true}))
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")))
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));


const sessionOptions = {

  secret:process.env.SECRET,
  resave: false,
  saveUninitialized :false,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
};



app.use(session(sessionOptions));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }

    user.authenticate(password, (err, user, options) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: options.message });
      }
      return done(null, user);
    });
  } catch (err) {
    return done(err);
  }
}));









passport.use(User.createStrategy());




passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.User2 = req.body;
  next();
});

// Use the listings routes
app.use("/listings", listingsRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Error handling middleware (optional)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// Start the server
const PORT = process.env.PORT || 8081; // Change to 8081 or another available port
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
