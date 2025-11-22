const express = require("express");
const router = express.Router();
const listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js")
const expressError = require("../utils/expressError.js")
const {listingSchema, reviewSchema} = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el=>el.message).join(",");
        throw new expressError(400, errMsg);
    }
    else{
        next();
    }
}

//Index Route
router.get("/", async(req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", {allListings})

});

// new Route
router.get("/new", isLoggedIn,(req, res) => {
    res.render("listings/new.ejs")
})

//show Route
router.get("/:id", wrapAsync(async(req, res) => {
    let {id} = req.params;
    const oneListing = await listing.findById(id).populate("reviews").populate("owner");
    if(!oneListing){
        req.flash("error", "Cannot find that Listing!");
        res.redirect("/listings");
    }
    // console.log(oneListing);
    res.render("listings/show.ejs",{ oneListing });
})
);

//Create Route
router.post("/", validateListing,isLoggedIn, wrapAsync(async(req, res) => {    
    // Handle empty image field - remove it so Mongoose can apply default
    if (!req.body.listing.image || req.body.listing.image.trim() === "") {
        delete req.body.listing.image;
    }
    let newListings = new listing(req.body.listing);
    newListings.owner = req.user._id;
    await newListings.save();
    req.flash("success", "Successfully added a new Listing!");
    res.redirect("/listings");
 })
);

//Edit Route
router.get("/:id/edit",isLoggedIn, wrapAsync(async(req, res) => {
    let {id} = req.params;
    const oneListing = await listing.findById(id);
    await oneListing.save();
    if(!oneListing){
        req.flash("error", "Cannot find that Listing!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{oneListing});
})
);

//Update Route
router.put("/:id", validateListing,isLoggedIn, isOwner, wrapAsync(async(req, res) => {
    let{id} = req.params;


    // let Listing = await listing.findById(id);
    // if(!currUser && Listing.owner.equals(res.locals.currUser._id)){
    //     req.flash("error","You do not have permission to edit");
    //     res.redirect(`/listings/${id}`);
    // }

    // Handle empty image field - remove it so Mongoose can apply default
    if (!req.body.listing.image || req.body.listing.image.trim() === "") {
        delete req.body.listing.image;
    }
    await listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`)
})
);

//Delete Route
router.delete("/:id",isLoggedIn, wrapAsync(async(req, res) => {
    let {id} = req.params;
    const deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", `Listing ${deletedListing.title} has been removed!`);
    res.redirect("/listings");
  })
);


module.exports = router;