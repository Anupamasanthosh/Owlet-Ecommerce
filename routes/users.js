const { response } = require("express");
const e = require("express");
var express = require("express");
const userHelpers = require("../helpers/user-helpers");
const productHelpers = require("../helpers/product-helpers");
const categoryHelpers = require("../helpers/category-helpers");
const { blockUser } = require("../helpers/user-helpers");
const userController=require('../controller/userController')
const multer = require("multer");
const { Db } = require("mongodb");
var router = express.Router();
const razorPay=require('razorpay');
const { get, route, options } = require("./admin");
const hbs=require('express-handlebars')
var expressHbs=require('handlebars')


expressHbs.registerHelper('ifCond',
function(v1,v2,options)
{
  if(v1!=v2)
  {
    return options.fn(this)
  }
  return options.inverse(this)
})

expressHbs.registerHelper('ifCond2',
function(v1,v2,options)
{
  if(v1===v2)
  {
    return options.fn(this)
  }
  return options.inverse(this)
})

expressHbs.registerHelper('if_eq', function(a, opts) {
  if (a) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});
expressHbs.registerHelper('ifCond2',
function(v1,v2,options)
{
  if(v1===v2)
  {
    return options.fn(this)
  }
  return options.inverse(this)
})



expressHbs.registerHelper('if_eq1', function(a,b,opts) {
  if (a===b) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});
expressHbs.registerHelper('eq', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1);
  return args.every(function (expression) {
      return args[0] === expression;
  });
});
// expressHbs.registerHelper('times', function(n, block) {
//   var accum = '';
//   for(var i = 0; i < n; ++i)
//       accum += block.fn(i);
//   return accum;
// });


router.get('/',userController.userLoginGet)

router.post('/',userController.userLoginPost)

router.get("/logout",userController.logOutGet)

const verifyLogin = (req, res, next) => {
  //console.log('this is verifylogin')
  //console.log(req.session.loggedIn)
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
};

router.get('/users',userController.getUserHome)

router.get("/product-details/:id",userController.productDetailsGet)

router.get('/category-view/:name',userController.categoryViewGet)

router.get('/signup',userController.userSignupGet)

router.post('/signup',userController.userSignupPost)
 
// router.use(verifyLogin)

router.get('/add-to-cart/:id', verifyLogin,userController.addToCartGet)

router.get('/cart',verifyLogin, userController.cartGet)

router.post("/change-product-quantity",verifyLogin,userController.changeProductQuantityGet)

router.get('/remove-product/:id',verifyLogin,userController.removeProductGet)

router.post('/applyCoupon',verifyLogin,userController.couponApplyPost)

router.get("/checkOut",verifyLogin,userController.checkOutGet)

router.get('/edit-checkOutAddress/:id',verifyLogin,userController.checkoutEditAddressGet)

router.post('/editcheckOutAddress/:id',verifyLogin,userController.checkoutEditAddressPost)

router.post('/proceed',verifyLogin,userController.proceedGet)

router.post('/verifyPayment',verifyLogin,userController.verifyPaymentPost)

router.get('/orderPlaced',verifyLogin,userController.orderPlacedGet)

router.get("/view-order",verifyLogin,userController.ViewOrderGet)

router.get('/viewOrderDetails/:id',verifyLogin,userController.viewOrderDetailsGet)

router.get("/cancel-order/:id",verifyLogin,userController.cancelOrderGet)

router.get('/downloadInvoice/:id',verifyLogin,userController.downloadInvoice)

router.get("/profile", verifyLogin,userController.ViewProfileGet)

router.get('/brand-view/:id',userController.brandViewGet)

router.post("/add-address",verifyLogin,userController.addAddressPost)

router.get("/edit-address/:id",verifyLogin,userController.editAddressGet)

router.post("/editAddress/:id",verifyLogin, userController.editAddressPost)

router.get("/delete-address/:id", verifyLogin,userController.deleteAddressGet)

router.get("/wishlist/:id",verifyLogin,userController.wishlistGet)

router.get("/wishlists", verifyLogin, userController.wishlistViewGet)

router.get('/delete-from-wishlist/:id',verifyLogin,userController.deleteFromWishlistGet)

router.post('/return',verifyLogin,userController.returnPost)



module.exports = router;
