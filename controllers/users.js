const User= require("../models/user.js");
const asyncHandler = require('express-async-handler');
//const crypto = require('crypto');
const passport = require('passport');
//const nodemailer = require('nodemailer');

//const transporter = nodemailer.createTransport({
 // service: 'Gmail',
 // auth: {
//    user: process.env.EMAIL,
//    pass: process.env.EMAIL_PASSWORD,
//  },
//});


module.exports.signup_render =(req,res)=>{
res.render("users/signup.ejs");

};

module.exports.signup =async(req,res)=>{
  const {username,email,password} = req.body;
    if (!username || !email) {
    req.flash('error', 'Username and Email are required.');
    return res.redirect('/signup');
  }

try{
    const newUser = new User({username,email});
    const regiUser = await User.register(newUser,password);
    console.log(regiUser);
    req.login(regiUser,(err)=>{
        if(err){
            return next(err);
        }
       req.flash("success","Wellcome to KAJWA :)")

      res.redirect("/listings");
    })
}catch(e){
    req.flash("error",e.message);
    res.redirect("/signup")

}

};

module.exports.login_render =(req,res)=>{
res.render("users/login.ejs");
};

module.exports.login=async(req,res)=>{
       const {email,username,role} =  req.body;
  const name = await User.findOne({ email });
    if(email ==="chetanshende137@gmail.com"){
        req.flash("success"," ** Hii Chetan (Admin)  Welcome sir ... into KAJWA :) ")
        }
     else {
        req.flash("success",`WelcomeBack @${name.username}** Into KAJWA.. :) `)
        }

let redirectUrl = res.locals.redirectUrl || "/listings";

res.redirect(redirectUrl);

};

module.exports.logout=(req,res,next)=>{
    req.logout((err)=>{
        if(err){
            return next(err);

        }
        req.flash("success","You are LOGOUT now!");
        res.redirect("/listings");
    });
};
