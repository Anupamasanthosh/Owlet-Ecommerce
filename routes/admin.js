var express = require("express");
const { Admin, Db } = require("mongodb");
const { response } = require("../app");
const categoryHelpers = require("../helpers/category-helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
var router = express.Router();
const session = require("express-session");
var objectId = require("mongodb").ObjectId;
var multer = require("multer");
var path = require("path");
var hbs = require("express-handlebars");
var chart=require('chart.js');
const { count } = require("console");
const { getchartData } = require("../helpers/user-helpers");
const adminController=require('../controller/adminController')
var expressHbs=require('handlebars');



expressHbs.registerHelper('ifCond1',
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
expressHbs.registerHelper('if_eq1', function(a,b,opts) {
  if (a===b) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});

/* GET home page. */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: storage,
  // fileFilter: (req, file, cb) => {
  //   if (
  //     file.mimetype == "image/png" ||
  //     file.mimetype == "image/jpg" ||
  //     file.mimetype == "image/jpeg" ||
  //     file.mimetype == "image/webp"
  //   ) {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error("Only .png .jpg and .jpeg format allowed"));
  //   }
  // },
});

const verifyLogin=(req,res,next)=>
{
  if(req.session.login)
  {
    next()
  }
  else
  {
    res.redirect('/admin')
  }
}

router.get("/",adminController.adminLoginGet)


router.post('/',adminController.adminLoginPost)

router.get("/adminlogout",adminController.adminLogoutGet)

router.use(verifyLogin)

router.get("/adminDash",adminController.adminDashGet)

router.get("/adminHome", adminController.adminHomeGet)

router.get("/add-product",adminController.adminAddProductGet)

router.post("/add-product", upload.array("image", 8),adminController.adminAddProductPost)

router.get("/edit-product/:id",adminController.editProductGet)

router.post("/edit-product/:id", upload.array("image", 8),adminController.editProductPost)

router.get("/delete-product/:id", adminController.deleteProductGet)

router.get("/category",adminController.CategoryGet)

router.get("/add-category",adminController.addCategoryGet)

router.post("/add-category", upload.single("image"),adminController.addCategoryPost)

router.get("/edit-category/:id",adminController.editCategoryGet)

router.post("/edit-category/:id",upload.single('image'),adminController.editCategoryPost)

router.get("/delete-category/:id", adminController.deleteCategoryGet)

router.get("/user-manage",adminController.manageUserGet)

router.get("/block-user/:id/:isBlocked",adminController.blockUserGet)

router.get("/orders",adminController.getOrdersGet)

router.post("/updateStatus/:id",adminController.updateStatusPost)

router.get('/removeOrder/:id',adminController.removeOrderGet)

router.get('/getChartData',getchartData)

router.get('/Coupons',adminController.couponsGet)

router.get('/Offers',adminController.OffersGet)

router.get('/edit-Offer/:id',adminController.editOfferGet)

router.post('/edit-Offer',adminController.editOfferPost)

router.get('/add-Offer/:id',adminController.addOfferGet)

router.post('/add-Offer',adminController.addOfferPost)

router.get('/delete-Offer/:id',adminController.deleteOfferGet)

router.post('/add-coupons',adminController.addCoupons)

router.get('/editCoupons/:id',adminController.editCoupons)

router.post('/editCoupons/:id',adminController.editCouponsPost)

router.get('/deleteCoupons/:id',adminController.deleteCoupons)

router.get('/Brands',adminController.brandGet)

router.get('/add-brands',adminController.addBrandGet)

router.post('/add-brand', upload.single("image"),adminController.addBrandPost)

router.get('/edit-brand/:id',adminController.brandEditGet)

router.post('/edit-brand/:id',upload.single('image'),adminController.brandEditPost)

router.get('/delete-brand/:id',adminController.brandDeleteGet)

router.get('/returnApprove/:id',verifyLogin,adminController.updateReturn)

router.get('/returnReject/:id',verifyLogin,adminController.updateReturnReject)

router.get('/edit-CatOffer/:id',verifyLogin,adminController.editCatOfferGet)

router.post('/edit-CatOffer',verifyLogin,adminController.editCatOfferPost)

router.get('/add-CatOffer/:id',adminController.addCatOfferGet)

router.post('/add-CatOffer',verifyLogin,adminController.updateCatOffer)

router.get('/delete-CatOffer/:id',verifyLogin,adminController.deleteCategoryOffer)

module.exports = router;
