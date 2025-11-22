const express = require("express");
const Router = express.Router();
const User = require("../models/user");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { savedRedirectUrl } = require("../middleware");

Router.get("/singup", (req, res) => {
    res.render("users/singup.ejs");
});

Router.post("/singup", wrapAsync(async(req, res) => {
    try{
    let{username, email, password} = req.body;
    let newUser = new User({username, email});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err){
            return next(err);
        }
            req.flash("success", "Welcome to My_Trip");
            res.redirect("/listings");
    })
    }catch(err){
        req.flash("error",err.message);
        res.redirect("/singup");
    }
}));

Router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

Router.post("/login",savedRedirectUrl, passport.authenticate('local', {failureFlash: true, failureRedirect:"/login"}),
    async(req,res)=>{
    req.flash("success","welcome back!");
    res.redirect(res.locals.redirectUrl || "/listings");
});

Router.get("/logout",(req, res, next) => {
    req.logout((err) => {
        if(err){
            nexr(err);
        }
        req.flash("success","You have logged out!");
        res.redirect("/listings");
    })
})

module.exports = Router;