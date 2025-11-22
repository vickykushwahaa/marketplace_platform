const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js")
const expressError = require("../utils/expressError.js")
const Review = require("../models/review.js");
const listing = require("../models/listing.js");
const {reviewSchema} = require("../schema.js");


const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map(el=>el.message).join(",");
        throw new expressError(400, errMsg);
    }
    else{
        next();
    }
}

//Post Review route
router.post("/",validateReview, wrapAsync(async(req, res) => {
    let oneListing = await listing.findById(req.params.id);
    const newReview = new Review(req.body.review);

    oneListing.reviews.push(newReview);
    await newReview.save();
    await oneListing.save();
    req.flash("success", "Review added successfully!");
    res.redirect(`/listings/${oneListing._id}`);
}))

//Detele Review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let {id,reviewId} = req.params;
    await listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully!");
    res.redirect(`/listings/${id}`);
}));

module.exports = router;