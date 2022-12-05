var userHelpers = require("../helpers/user-helpers");
const bcrypt = require("bcrypt");
const { response, path } = require("../app");
const productHelpers = require("../helpers/product-helpers");
const categoryHelpers = require("../helpers/category-helpers");
const easyInvoice=require('easyinvoice')
const fs=require('fs');
const { Db } = require("mongodb");




module.exports = {
  userLoginGet: (req, res, next) => {
    if (req.session.users) {
      console.log(req.session)
      res.redirect("/users");
    } else {
      res.render("userLogin", { loginErr: req.session.loginErr });
      req.session.loginErr = false;
    }
  },
  userLoginPost: (req, res, next) => {
    userHelpers.doLogin(req.body).then((response) => {
      let status = response.status;
      if (status) {
       
        req.session.users = response.user;
        req.session.loggedIn = true;

        // console.log(req.session.users,'jayayayayaya')
        // console.log(req.body);
        userHelpers.findUser(req.body.email).then((response) => {
          // console.log("this is reponse", response);
          if (response.isBlocked === false) {
            req.session.loginErr = true;
            
          } else {
            res.redirect("/users");
          }
        });
      } else {
        req.session.loginErr = true;

        res.redirect("/");
      }
    });
  },
  getUserHome: async (req, res, next) => {
    let users = req.session.users;

    let cartcount = null;
    let cartCount = parseInt(cartcount);

    if (req.session.users) {
      cartCount = await userHelpers.getCartCount(req.session.users._id);
    }
    console.log(req.session)
    productHelpers.getAllProduct().then((product) => {
      categoryHelpers.getAllCategory().then((category) => {
        productHelpers.findAllBrands().then((brand)=>
        {
          
          res.render("users/user-home", {
            users,
            brand,
            product,
            cartCount,
            category,
            user: true,
          });
        })
        
      });
    });
  },
  productDetailsGet: async (req, res, next) => {
    let users = req.session.users;
    let product = await productHelpers.getAllProductDetails(req.params.id);
    if (users) {
      res.render("users/product-details", { users, user: true, product });
    } else {
      res.render("users/product-details", { product, user: true });
    }
  },
  categoryViewGet: async (req, res, next) => {
    let users = req.session.users;
    let product = await categoryHelpers.getCategoryProducts(req.params.name);
    let category=await categoryHelpers.getCategoryDetails(req.params.name)
    // console.log(product);
    // console.log(category)
    res.render("users/category-view", {category, users, product, user: true });
  },
  userSignupGet: (req, res, next) => {
    res.render("signup");
  },
  userSignupPost: (req, res, next) => {
    req.body.isBlocked = true;
    userHelpers.getAllUsers().then((user) => {
      userHelpers.findUser(req.body.email).then((UserEmail) => {
        if (UserEmail) {
          res.redirect("/signup");
        } else {
          userHelpers.doSignUp(req.body).then((response) => {
           
            console.log(req.session)
            req.session.user = response;
            res.redirect("/");
          });
        }
      });
    });
  },
  addToCartGet: (req, res, next) => {
    if (req.session.users) {
      userHelpers.addToCart(req.params.id, req.session.users._id).then(() => {
        res.redirect("/users");
      });
    } else {
      res.redirect("/");
    }
  },
  cartGet: async (req, res, next) => {
    try{
      
    const users = req.session.users;
    let products = await userHelpers.getCartProducts(req.session.users._id);
    if (products.length === 0) {
      res.render("users/cartEmpty", { users, user: true });
    } else {
      let cartCount = await userHelpers.getCartCount(req.session.users._id);

      userHelpers.getTotalAmount(req.session.users._id).then((total) => {
        totalValue = total[0].total;
        
        res.render("users/cart", {
          cartCount,
          totalValue,
          users,
          products,
          user: true,
        });
      });
    }
  }
  catch{
    res.render('/')
  }
  },
  changeProductQuantityGet: (req, res, next) => {
    userHelpers.changequantity(req.body).then(async (response) => {
      userHelpers.getTotalAmount(req.session.users._id).then((data) => {
        response.total = data[0]?.total;

        res.json(response);
      });
    });
  },
  removeProductGet: (req, res, next) => {
    let proId = req.params.id;
    // console.log(proId)
    userHelpers.deleteCartProduct(req.session.users._id, proId);
    res.redirect("/cart");
  },
  couponApplyPost:(async (req,res,next)=>
  {
    console.log(req.body)
   
    let coupon=await productHelpers.findCouponCode(req.body.couponCode)
    
    let status=true
    if(coupon)
    {
      userHelpers.getTotalAmount(req.session.users._id).then((data)=>
      {
        console.log(data,'data')
        console.log(coupon,'coupon')
       
        let total=data[0].total
        console.log('jjj',total)
        console.log(coupon.Minimum)
        if(total>coupon.Minimum)
        {
          total=total-coupon.Discount
        }
        else
        {
          total=total
          status=false
        }
        
        // console.log(total,'kkkk')
        
        res.json({total,status})
      })
    }
    else
    {
      // console.log('happy')
      let status=false
      res.json({status})
      
    }
  }),
  checkOutGet: async (req, res, next) => {
    let users = req.session.users;

    userHelpers.getTotalAmount(req.session.users._id).then((total) => {
      
      userHelpers.ViewAllAddress(req.session.users._id).then((address) => {
        //if condition kodkknm
        totalValue = total[0].total;
        res.render("users/checkOut", {
          address,
          users,
          totalValue,
          user: true,
        });
      });
    });
  },
  // editAddressGet: async (req, res, next) => {
  //   let users = req.session.users;
  //   let address = await userHelpers.viewAddress(req.params.id, users._id);

  //   let AddressDetails = users.Address[address];

  //   res.render("users/edit-address", { users, AddressDetails, user: true });
  // },
  checkoutEditAddressGet:async (req,res,next)=>
  {
    let users=req.session.users
    let address = await userHelpers.viewAddress(req.params.id, users._id);
    let AddressDetails = users.Address[address];
    res.render("users/checkOutAddressEdit", { users, AddressDetails, user: true });
  },
  checkoutEditAddressPost:async (req,res,next)=>
  {
    console.log(req.body)
    console.log(req.params.id)
    let address=await userHelpers.viewAddress(req.params.id,req.session.users._id)
    let addressdetails=req.body
    userHelpers.updateAddress(address, req.session.users, addressdetails).then(() => {
    res.redirect('/checkOut')
    })
  },
 
  proceedGet: async (req, res, next) => {
    // console.log("proceed body", req.body);
    if(req.session.users)
    {
      let cartItems = await userHelpers.getCartProducts(req.session.users._id);
      let total=parseInt(req.body.amount)
      // console.log(total)
   
      userHelpers.placeOrder(req.body, cartItems, total).then((orderId) => {
        if (req.body.payment === "COD") {
          // console.log("hello");
          res.json({ codStatus: true });
        } else if (req.body.payment === "Razorpay") {
          userHelpers.generateRazorpay(orderId, total).then((response) => {
          
            res.json(response);
          });
        } else if(req.body.payment==='paypal') {
          // console.log("paypall");
          // userHelpers.generatePaypal(orderId).then(()=>
          // {
          //   console.log('hello guys')
          //   res.json({paypalStatus:true})
          // })
          
        }
        else{
          // console.log('no payment options')
        }
      });
    // });
  }
  else
  {
    res.redirect('/')
  }
  },
  verifyPaymentPost: (req, res, next) => {
    console.log("this is the body", req.body["order[receipt]"]);
    userHelpers
      .verifyPayment(req.body)
      .then(() => {
        // console.log("hello haiii");
        userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
          // console.log("kutta sano vann");
          res.json({ status: true });
        });
      })
      .catch((err) => {
        // console.log(err);
        res.json({ status: false });
      });
  },
  orderPlacedGet: async (req, res, next) => {
    let users = req.session.users;
    // let orders=await userHelpers.viewOrder(req.session.users._id)
    // console.log('orders from order placed',orders)
    res.render("users/order-placed", { users, user: true });
  },
  ViewOrderGet: (req, res, next) => {
      let users = req.session.users;
      userHelpers.viewOrder(users._id).then((orders) => {
        if(orders.length===0)
        {
          res.render('users/orderEmpty',{user:true,users})
        }
        else{
          res.render("users/orders", {orders, users, user: true });
        }
      
    });
  },
  viewOrderDetailsGet:((req,res,next)=>
  {
    let users=req.session.users
    // console.log(req.params.id)
    // console.log('huoi',req.params.id)
    userHelpers.getOrderDetails(req.params.id).then((orderDetails)=>
    {
      console.log('hello mello',orderDetails)
      res.render('users/viewOrder',{orderDetails,users,user:true})
    })
    
  }),
  cancelOrderGet: (req, res, next) => {
    let users = req.session.users;
    let orderId = req.params.id;
    userHelpers.cancelOrder(users._id, orderId).then((response) => {
      res.redirect("/view-order");
    });
  },
  downloadInvoice:async (req,res,next)=>
  {
    
    let order=await userHelpers.getOrderDetails(req.params.id)
    {
      console.log(order)
      res.render('users/invoice',{order})
    }
    
  },
  ViewProfileGet: async (req, res, next) => {
    let users = req.session.users;

    userHelpers.findUser(users.email).then(async (userdata) => {
      let userData = userdata;
      // console.log("userData", userData);
      res.render("users/profile", { userData, users, user: true });
    });
  },
  brandViewGet:(async(req,res)=>
  {
    console.log(req.params.id)
    let users=req.session.users
    let products=await productHelpers.findProduct(req.params.id)
    let brand=await productHelpers.findBrandName(req.params.id)
    console.log(brand)
    res.render('users/brand-view',{brand,user:true,users,products})
  }),
  logOutGet: (req, res, next) => {
    console.log(req.session)
    req.session.loggedIn=false
    req.session.users=null
    res.redirect("/users");
  },
  addAddressPost: (req, res, next) => {
    // console.log(req.body);
    let address = req.body;
    let users = req.session.users;
    //console.log('user',users)
    userHelpers.addAddress(users._id, address).then((response) => {
      res.redirect("/profile");
    });
  },
  editAddressGet: async (req, res, next) => {
    let users = req.session.users;
    let address = await userHelpers.viewAddress(req.params.id, users._id);

    let AddressDetails = users.Address[address];

    res.render("users/edit-address", { users, AddressDetails, user: true });
  },
  editAddressPost: async (req, res, next) => {
    let addId = req.params.id;

    let addressdetails = req.body;
    // console.log("address details", addressdetails);
    let users = req.session.users;
    let address = await userHelpers.viewAddress(req.params.id, users._id);

    userHelpers.updateAddress(address, users, addressdetails).then(() => {
      res.redirect("/profile");
    });
  },
  deleteAddressGet: async (req, res, next) => {
    let users = req.session.users;
    // console.log(req.params.id);
    let address = await userHelpers.viewAddress(req.params.id, users._id);
    
    userHelpers.deleteAddress(address, users);
    res.redirect("/profile");
  },
  wishlistGet: (req, res, next) => {
    if (req.session.users) {
      
      productHelpers.getAllProductDetails(req.params.id).then((product) => {
        
        userHelpers
          .addToWishlist(req.session.users, req.params.id, product)
          .then((response) => {
            
            res.redirect("/users");
          });
      });
    } else {
      res.redirect("/");
    }
  },
  wishlistViewGet: async (req, res, next) => {
    let users = req.session.users;
    let products = await userHelpers.viewWishlist(users._id);
    console.log(products)
    if (products.length === 0) {
      res.render("users/wishlistEmpty", { users, user: true });
    } else {
      console.log("yoou", products);
      res.render("users/wishlist", { users, products, user: true});
    }
  },
  deleteFromWishlistGet:((req,res,next)=>
  {
    console.log(req.params.id)
    userHelpers.deleteWishlistProduct(req.session.users._id,req.params.id)
    
      res.redirect('/wishlists')
    
   
  }),
  returnPost:((req,res,next)=>
  {
    console.log('hello')
    console.log(req.body)
    // userHelpers.updateReturn(req.body).then(()=>
    // {
    //   res.redirect('/view-order')
    // })
    productHelpers.updateReturn(req.body).then(()=>
    {
      res.redirect('/view-order')
    })
  }),
  
};
