const listing = require("./models/listing");
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
       req.flash('error','You must be logged in to do that');
       return res.redirect('/login');  
  }
  next();
};

module.exports.savedRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let Listing = await listing.findById(id);
    if(!currUser && Listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You do not have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
}