var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var fs = require("fs");
var session = require("express-session");
var multer=require('multer')
var flash=require('connect-flash')
const razorPay=require('razorpay')
const easyInvoice=require('easyinvoice')
var expressHbs=require('handlebars');

//hbs create 



var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
const { extname } = require("path");


var app = express();
//var fileUpload = require("express-fileupload");
var db = require("./config/connection");
const { handlebars } = require("hbs");
// const { options } = require("./routes/admin");


expressHbs.registerHelper('if_eq1', function(a,b,opts) {
  if (a===b) {
      return opts.fn(this);
  } else {
      return opts.inverse(this);
  }
});



  
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
//app.use(fileUpload());



//session

app.use(
  session({
    secret: "key",
    resave: false,
    saveUninitialized: true,
  })
);
//messages
 app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages =req.flash('success')
  next();
});
app.use(function(req, res, next){
  res.locals.success = req.flash('success');
  res.locals.error=req.flash('error')
  next();
});

//database creation
db.connect((err) => {
  if (err) console.log("error");
  else console.log("connected to database.....");
});

app.use("/", usersRouter);
app.use("/admin", adminRouter);

// const newAdmin = new Admin({
//   email: "admin@gmail.com",
//   password: "admin",
// });
// newAdmin.save();

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
