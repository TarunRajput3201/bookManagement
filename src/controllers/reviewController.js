const bookModel = require("../models/bookModel")
let reviewModel=require("../models/reviewModel")


const {isValidObjectId, validateString,validateRequest,validateNumber} = require("../validator/validation")



//  <=================================>[Create Rewiew API] <==============================>


const createReview = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if(!isValidObjectId){
            return res.status(400).send({
                status: false,
                message: "Book id invalid"
            })
        }
        const reviewData = req.body
        if(!validateRequest(reviewData)){
            return res.status(400).send({
                status: false,
                message: "Body is required for create rewiew "
            })
        }
        let {reviewedBy,
            rating,
            review} = reviewData
        if(!validateString(reviewedBy)){
            reviewedBy = "Guest"
        }
        if(!rating){
            return res.status(400).send({
                status: false,
                message: "Rating is required"
            })
        }
        if(typeof rating !== 'number'){
            return res.status(400).send({
                status: false,
                message: "Rating must be number only"
            })
        }
        if(rating < 1 || rating > 5){
            return res.status(400).send({
                status: false,
                message: "Rating must be 1 to 5"
            })
        }
        if(Object.keys(reviewData).indexOf("review") !== -1){
            if(!validateString(review)){
                return res.status(400).send({
                    status:false,
                    message: "Review is empty, Need to add some value"
                })
            }
        }
        const checkBook = await bookModel.findById(bookId)
        if(!checkBook){
            return res.status(404).send({
                status: false,
                message: "Book not found"
            })
        }
        if(checkBook.isDeleted == true){
            return res.status(404).send({
                status: false,
                message: "Book already deleted, You can't add review"
            })
        }
        let obj = {
            reviewedBy,
            rating,
            review,
            bookId,
            reviewedAt: new Date()
        }
        const reviewCreate = await reviewModel.create(obj)

        if(reviewCreate){
            await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: 1}})
        }
        const sendReview = await reviewModel.find({_id: reviewCreate._id}).select({
            __v: 0,
            createdAt: 0,
            updatedAt: 0,
            isDeleted: 0

        })
        // if(reviewCreate){
        //     let reviewIncr = checkBook.reviews + 1
        //     checkBook.reviews = reviewIncr
        //     await checkBook.save()
        // }
        res.status(201).send({
            status: true,
            message: "Success",
            data: sendReview
        })
    } catch (error) {
        res.status(500).send({
            status: false,
            message: error.message,
        });
        
    }
}





const updateReview = async function (req, res) {
    try {
      if (!validateRequest(req.body)) {
        return res
          .status(400)
          .send({ status: false, message: "Please input valid request" });
      }
  
      let { review, rating, reviewedBy } = req.body;
      let bookId = req.params.bookId;
      let reviewId = req.params.reviewId;
  
      if (!isValidObjectId(bookId) || !isValidObjectId(reviewId)) {
        return res
          .status(400)
          .send({ status: false, message: "Enter valid bookId or reviewId" });
      }
  
     
        if (!validateString(review)) {
          return res
            .status(400)
            .send({ status: false, message: "Enter valid review" });
        }
      
  
      if (rating != undefined) {
        if (!validateNumber(rating)) {
          return res
            .status(400)
            .send({ status: false, message: "Enter valid rating" });
        }
      }
      if(rating < 1 || rating > 5){
        return res.status(400).send({
            status: false,
            message: "Rating must be 1 to 5"
        })
    }
  
     
        if (!validateString(reviewedBy)) {
          return res
            .status(400)
            .send({ status: false, message: "Enter a valid Name" });
        }
      
  
      let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
      if (!book) {
        return res
          .status(404)
          .send({ status: false, message: "Book not found or is deleted" });
      }
  
      const bookReview = await reviewModel.findOneAndUpdate(
        { _id: reviewId, bookId: bookId },
        { $set: { review: review, rating: rating, reviewedBy: reviewedBy } },
        { new: true }
      );
  
      if (!bookReview) {
        return res.status(404).send({
          status: false,
          message: "Review not found or is not for given bookId in url",
        });
      }
  
       book._doc["reviewsData"] = [bookReview];

  
      return res
        .status(200)
        .send({ status: true, message: "Books list", data: book });
    } catch (err) {
      res.status(500).send({ status: false, message: err.message });
    }
  };


let deleteReview=async function(req,res){
   try{ let bookId=req.params.bookId
    let reviewId=req.params.reviewId
    let book=await bookModel.find({_id:bookId})
    if(book.length==0){return res.status(404).send({status:false, message:"book doesnot exists"})}

    let review=await reviewModel.findById(reviewId)
    if(!review){return res.status(404).send({status:false, message:"book review doesnot exists"})}
    if(review.isDeleted==true){return res.status(404).send({status:false,message:"this review is already deleted"})}
    let deleteReview=await reviewModel.findOneAndUpdate({_Id:reviewId},{$set:{isDeleted:true}})
    
    
     let reviewsleft=await reviewModel.find({bookId:bookId,isDeleted:false})
    
     let reviews=reviewsleft.length
     
     let updatedData=await bookModel.findOneAndUpdate({_id:bookId},{$set:{reviews:reviews}})
     res.status(200).send({status:true, message:"Success"})

   }
   catch(err){
    res.status(500).send({status:false,message:err.message})   }
}
module.exports={createReview,updateReview,deleteReview}