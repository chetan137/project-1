// Load environment variables
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Only load dotenv in non-production environments
}
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const listingsRoutes = require("./routes/listings");
const RouteUser = require("./routes/user.js");

const path = require("path");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user"); // Ensure correct User model import
const ejsMate = require("ejs-mate");
const bodyParser = require('body-parser');
const { upload } = require("./cloudCONFIG"); // This handles both images and video

// Initialize express app
const app = express();

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON requests


app.use(bodyParser.json());

app.use(methodOverride("_method"));

// Set EJS as the view engine and configure template engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SECRET || 'your-secret-key', // Use environment variable for security
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}));

// Flash messages middleware
app.use(flash());

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy setup
passport.use(new LocalStrategy({
  usernameField: 'email', // Use 'email' instead of 'username'
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

// Passport serialization and deserialization
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

// Flash messages and current user in every template
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Use the listings routes
app.use("/listings", listingsRoutes);
app.use("/",RouteUser);
// MongoDB connection setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Global error handling middleware (optional)


// Error handling middleware
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});


app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"PageNot Found!"))
})

app.use( (err,req,res,next)=>{

  let{statusCod =505,message="SomeThing went Wrong!"}=err;
  res.status(statusCod).render("error.ejs",{message});

});

app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        // Multer-specific errors
        res.status(400).json({ error: 'Multer error: ' + err.message });
    } else if (err.message === 'Invalid file type. Only PNG, JPG, JPEG, PDF, MP4, and MOV are allowed.') {
        res.status(400).json({ error: err.message });
    } else {
        res.status(500).json({ error: 'Something went wrong' });
    }
});
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong!' } = err;


    if (statusCode === 400) {
        return res.status(400).json({
            status: 'error',
            message: message || 'Bad Request',
        });
    }

    // Default behavior for other errors
    res.status(statusCode).json({
        status: 'error',
        message: message || 'Internal Server Error',
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Invalid file type or no file uploaded' });
    }

    // If upload successful, Cloudinary returns the URL in req.file.path
    res.json({ message: 'File uploaded successfully', fileUrl: req.file.path });
});
console.log("Views Directory: ", app.get('views'));

// Start the server on a defined port or 8081
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
