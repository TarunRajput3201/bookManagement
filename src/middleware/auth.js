let jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const bookModel=require("../models/bookModel")

const authenticate = function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide token in header" });
    }

    // let decodedToken = jwt.verify(token, "functionup-radon");
    // if (!decodedToken) {
    //   return res
    //     .status(400)
    //     .send({ status: false, message: "Token is not correct" });
    // }
    // storing the decoded token

    // req.token = decodedToken;
    
    jwt.verify(token,"functionup-radon", (err, user) => {
      if (err)
     
          return res.status(401).send({status:false,message: "invalid token"});
          req.user=user
          console.log(user)
      next();
  });
   
  } catch (err) {
    res.status(500).send({
      status: false,
      messsage: err.message,
    });
  }
};

const authorise = async function (req, res, next) {
  try {
    let { userId } = req.body;

    let checkData = await userModel.findOne({ _id: userId });
    if (!checkData) {
      return res.status(404).send({ status: false, message: "Invalid userId" });
    }

    if (checkData._id != req.user.userId) {
      return res
        .status(404)
        .send({ status: false, message: "Authorization failed." });
    }

    
    next();
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: err.message });
  }
};
const authorisePutAndDelete = async function (req, res, next) {
  try {
    let { bookId } = req.params;

    let checkData = await bookModel.findOne({ _id: bookId });
    if (!checkData) {
      return res.status(404).send({ status: false, message: "bookId doesnot exists" });
    }

    if (checkData.userId != req.user.userId) {
      return res
        .status(404)
        .send({ status: false, message: "Authorization failed." });
    }

    
    next();
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: err.message });
  }
};

module.exports = { authenticate, authorise,authorisePutAndDelete };
