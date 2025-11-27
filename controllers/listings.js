const listing = require("../models/listing");
module.exports.index  = async(req, res) => {
    const allListings = await listing.find({});
    res.render("listings/index.ejs", {allListings})
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs")
}

module.exports.showListing = async(req, res) => {
    let {id} = req.params;
let oneListing = await listing.findById(id)
    .populate({
        path: "reviews",
        populate: { path: "author" }
    });
    
    if(!oneListing){
        req.flash("error", "Cannot find that Listing!");
        res.redirect("/listings");
    }
    // console.log(oneListing);
    res.render("listings/show.ejs",{ oneListing });
}

module.exports.createListing = async(req, res) => {    
    // Handle empty image field - remove it so Mongoose can apply default
    let url = req.file.path;
    let filename = req.file.filename;
    if (!req.body.listing.image || req.body.listing.image.trim() === "") {
        delete req.body.listing.image;
    }
    let newListings = new listing(req.body.listing);
    newListings.owner = req.user._id;
    newListings.image = {url, filename};
    await newListings.save();
    req.flash("success", "Successfully added a new Listing!");
    res.redirect("/listings");
 }

 module.exports.editListing = async(req, res) => {
     let {id} = req.params;
     const oneListing = await listing.findById(id);
     await oneListing.save();
     if(!oneListing){
         req.flash("error", "Cannot find that Listing!");
         res.redirect("/listings");
     }
     let originalImageUrl = oneListing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

     res.render("listings/edit.ejs",{oneListing, originalImageUrl});
 }

 module.exports.updateListing = async(req, res) => {
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
    if(typeof req.file !== "undefined"){
    let Listing = await listing.findByIdAndUpdate(id, {...req.body.listing});
    let url = req.file.path;
    let filename = req.file.filename;
    Listing.image = {url, filename};
    }
    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`)
}

module.exports.deleteListing = async(req, res) => {
    let {id} = req.params;
    const deletedListing = await listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", `Listing ${deletedListing.title} has been removed!`);
    res.redirect("/listings");
  }