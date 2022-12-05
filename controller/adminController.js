
const { Db } = require("mongodb");
const { off } = require("../app");
const categoryHelpers = require("../helpers/category-helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");


module.exports={
    adminLoginGet:((req,res,next)=>
    {
        if (req.session.admin) {
          
            res.redirect("/admin/adminDash");
          } else {
            res.render("admin-login", { loginErr: req.session.AdminloginErr });
            req.session.AdminloginErr = false;
          }
    }),
    adminLoginPost:((req,res,next)=>
    {
        let admin = {
            Username: "admin@gmail.com",
            Password: "admin",
          };
          if (
            req.body.Username === admin.Username &&
            req.body.Password === admin.Password
          ) {
           
            
            req.session.admin = req.body;
            
            
            req.session.login=true
            console.log(req.session,'hoyyyyy')

            res.redirect("/admin/adminDash");
          } else {
            req.session.AdminloginErr = true;
            res.redirect("/admin");
          }
    }),
    adminLogoutGet:((req,res,next)=>
    {
        console.log(req.session)
        req.session.login=false
        req.session.admin=null
        res.redirect("/admin"); 
    }),
    adminDashGet:((req,res,next)=>
    {
        productHelpers.getAllProduct().then((product)=>
        {
    userHelpers.getAllUsers().then((user)=>
    {
     userHelpers.getAllOrders().then((orders)=>
     {
      let totalProduct=product.length
      let totalCustomers=user.length
      let totalOrder=orders.length
      res.render("admin/adminDash", {totalOrder, totalCustomers,totalProduct,admin: true });
   
     })
     })
    
  })
    }),
    adminHomeGet:((req,res,next)=>
    {
        let admin = req.session.admin;
        productHelpers.getAllProduct().then((product) => {
   
        res.render("admin/adminHome", {
      admin,
      product,
      admin: true,
    });
  });
    }),
    adminAddProductGet:((req,res,next)=>
    {
      productHelpers.findAllBrands().then((brand)=>
      {
        categoryHelpers.getAllCategory().then((category) => {

          res.render("admin/add-product", {brand, category, admin: true });
        });
      })
        
    }),
    adminAddProductPost:((req,res,next)=>
    {
      let price=req.body.Price
      
      let offer=req.body.offers
      let SellingPrice=0
      categoryHelpers.getCategoryDetails(req.body.Category).then((category)=>
      {
        console.log(category.offer,'catoffer')
        if(category.offer)
        {
          if(category.offer>offer)
          {
            offer=parseInt(category.offer)
            SellingPrice=(price*offer)/100
            actualPrice=price-SellingPrice
          }
          else{
            offer=parseInt(req.body.offers)
            SellingPrice=(price*offer)/100
            actualPrice=price-SellingPrice
          }
        }
        else
        {
          if(offer==='')
          {
            actualPrice=price
   
          }
          else
            {
              offer=parseInt(req.body.offers)
              SellingPrice=(price*offer)/100
              actualPrice=price-SellingPrice
            }
        }
      
    productHelpers.addProduct(req.body,req.files,actualPrice,).then(() => {
            
            
            
          res.redirect("/admin/adminHome");
        }); 
      })
      
     
    })
    ,
    editProductGet:(async(req,res,next)=>
    {
        let product = await productHelpers.getAllProductDetails(req.params.id);


        categoryHelpers.getAllCategory().then((category) => {
          productHelpers.findAllBrands().then((brand)=>
          {
            res.render("admin/edit-product", { admin: true, product,category,brand });
          })
          
        });
    }),
    editProductPost:((req,res,next)=>
    {
    console.log(req.params.id)
    console.log(req.files)
    // if(req.files?.length>0)
  //  {
      productHelpers.updateImage(req.params.id,req.files).then(()=>
      {

      })
  //  }
   console.log(req.body)
   let price=req.body.Price
   let offer=req.body.offers
   let actualPrice=0
   let sellingPrice=0
   categoryHelpers.getCategoryDetails(req.body.Category).then((category)=>
      {
        console.log(category.offer,'catoffer')
        if(category.offer)
        {
          if(category.offer>offer)
          {
            offer=parseInt(category.offer)
            SellingPrice=(price*offer)/100
            actualPrice=price-SellingPrice
          }
          else{
            offer=parseInt(req.body.offers)
            SellingPrice=(price*offer)/100
            actualPrice=price-SellingPrice
          }
        }
        else
        {
          if(offer==='')
          {
            actualPrice=price
   
          }
          else
            {
              offer=parseInt(req.body.offers)
              SellingPrice=(price*offer)/100
              actualPrice=price-SellingPrice
            }
        }
      
   productHelpers.updateProduct(req.params.id, req.body,actualPrice).then(() => {

    res.redirect("/admin/adminHome");
  });
})
    
    }),
    deleteProductGet:((req,res,next)=>
    {
        let proId = req.params.id;
        console.log(proId);
        productHelpers.deleteProduct(proId).then((response) => {
        res.redirect("/admin/adminHome");
  });

    }),
    CategoryGet:((req,res,next)=>
    {
            categoryHelpers.getAllCategory().then((category) => {
            res.render("admin/category", { category, admin: true });
          });
    }),
    addCategoryGet:((req,res,next)=>
    {
        res.render("admin/add-category", { admin: true });
    }),
    addCategoryPost:((req,res,next)=>
    {
            console.log("add category", req.body);
            categoryHelpers.addCategory(req.body, req.file).then(() => {
            res.redirect("/admin/category");
        });
    }),
    editCategoryGet:(async(req,res,next)=>
    {
        let category = await categoryHelpers.getAllCategoryDetails(req.params.id);
        console.log(category);
        res.render("admin/edit-category", { admin: true, category });
    }),
    editCategoryPost:((req,res,next)=>
    
    {   console.log(req.body,'hii')
        console.log(req.params.id);
        let id = req.params.id;
        // if(req.file?.filename)
        // {
          console.log(req.file)
      
          categoryHelpers.updateImage(req.params.id,req.file).then(()=>
          {
            
          })
        // }
        categoryHelpers.updateCategory(req.params.id, req.body).then(() => {
          res.redirect("/admin/category");
          
        });
    }),
    deleteCategoryGet:((req,res,next)=>
    {
        let catId = req.params.id;
        console.log(catId);
        categoryHelpers.deleteCategory(catId)
         
        res.redirect("/admin/category");
        
    }),
    manageUserGet:((req,res,next)=>
    {
            userHelpers.getAllUsers().then((customers) => {
            res.render("admin/adminUser", { customers, admin: true });
            
          });
    }),
    blockUserGet:((req,res,next)=>
    {
        let userId = req.params.id;
        let userStatus = req.params.isBlocked;
        console.log(userStatus);
        let status = true;
        if (userStatus == "true") {
          status = false;
        }
        userHelpers.blockUser(userId, status).then((response) => {
          res.redirect("/admin/user-manage");
        });
    }),
    getOrdersGet:(async(req,res,next)=>
    {
        userHelpers.getAllOrders().then(async (orders) => {
            console.log("orders alya", orders);
             let orderlength=orders.length
            
            
           
            res.render("admin/orders", {orders, admin: true });
          });
    }),
    updateStatusPost:((req,res,next)=>
    {
        console.log(req.params.id);
        let orderId = req.params.id;
        console.log(req.body);
        userHelpers.UpdateStatus(orderId, req.body).then(() => {
            res.redirect("/admin/orders");
        });
    }),
    removeOrderGet:((req,res,next)=>
    {
        const orderId=req.params.id
        console.log('orderid....',orderId)
        userHelpers.removeOrder(orderId).then(()=>
        {
          
          console.log('removed order')
          res.redirect("/admin/orders");
        })
         
    }),
    couponsGet:(async (req,res,next)=>
    {
        let coupons=await productHelpers.viewAllCoupons()
        console.log(coupons,'listeddd')
        res.render('admin/coupons',{coupons,admin:true})
    }),
    OffersGet:((req,res,next)=>
    {
      productHelpers.getAllProduct().then((products)=>
      {
        categoryHelpers.getAllCategory().then((category)=>
        {
          console.log(category)
        res.render('admin/Offers',{category,products,admin:true})
        })
        
      })
     
      
    }),
    editOfferGet:(async(req,res,next)=>
    {
      console.log(req.params.id)  
      let product=await productHelpers.getAllProductDetails(req.params.id)
      
    }),
    
    editOfferPost:((req,res,next)=>
    {
      console.log(req.body)
      productHelpers.updateOffer(req.body).then(()=>
      {
        console.log('product offer edited successfully')
        res.redirect('/admin/Offers')
      })
    }),
    addOfferGet:((req,res,next)=>
    {
      
    }),
    addOfferPost:((req,res,next)=>
    {
      console.log(req.body)
      productHelpers.addOffer(req.body).then(()=>
      {
        console.log('product offer added successfully')
        res.redirect('/admin/Offers')
      })
    }),
    deleteOfferGet:((req,res,next)=>
    {
      console.log(req.params.id)
      productHelpers.deleteOffer(req.params.id).then(()=>
      {
        
      })
      res.redirect('/admin/Offers')
    }),
    addCoupons:((req,res,next)=>
    {
      console.log(req.body)
      productHelpers.addCoupons(req.body).then(()=>
      {
        res.redirect('/admin/Coupons')
      })
    }),
    editCoupons:(async (req,res,next)=>
    {
      console.log(req.params.id)
      let coupon=await productHelpers.findCoupon(req.params.id)
      
      res.render('admin/edit-coupon',{coupon,admin:true})
    }),
    editCouponsPost:((req,res,next)=>
    {
      console.log(req.body)
      console.log(req.params.id)
      productHelpers.updateCoupon(req.body,req.params.id).then(()=>
      {
        res.redirect('/admin/Coupons')
      })
    }),
    deleteCoupons:((req,res,next)=>
    {
      console.log(req.params.id)
      productHelpers.deleteCoupon(req.params.id).then(()=>
      {
        res.redirect('/admin/Coupons')
      })
    }),
    brandGet:((req,res,next)=>
    {
      productHelpers.findAllBrands().then((brands)=>
      {
        console.log('this is brands',brands)
        res.render('admin/brand',{brands,admin:true})
      })
      
    }),
    addBrandGet:((req,res,next)=>
    {
      res.render('admin/add-brand',{admin:true})
    }),
    addBrandPost:((req,res,next)=>
    {
      console.log(req.body,req.file)
      productHelpers.addBrand(req.body,req.file).then(()=>
      {
        res.redirect('/admin/Brands')
      })
    }),
    brandEditGet:(async(req,res,next)=>
    {
      console.log(req.params.id)
      let brand=await productHelpers.findBrand(req.params.id)
      console.log(brand)
      res.render('admin/edit-brand',{brand,admin:true})
    }),
    brandEditPost:((req,res,next)=>
    {
      console.log(req.params.id)
      // if(req.file?.filename)
      // {
        console.log(req.file)
        productHelpers.updateBrandImage(req.params.id,req.file).then(()=>
        {

        })
      // }
      productHelpers.updateBrand(req.params.id,req.body).then(()=>
      {
        res.redirect('/admin/Brands')
      })
    }),
    brandDeleteGet:((req,res,next)=>
    {
      console.log(req.params.id)
      productHelpers.deleteBrand(req.params.id).then(()=>
      {
        res.redirect('/admin/Brands')
      })
    }),
    updateReturn:((req,res,next)=>
    {
      console.log('hello')
      console.log(req.params.id)
      productHelpers.updateReviewStatus(req.params.id).then(()=>
      {
        res.redirect('/admin/orders')
      })
     }),
     updateReturnReject:((req,res,next)=>
     {
      console.log('helloooo')
      console.log(req.params.id)
      productHelpers.updateReviewStatusReject(req.params.id).then(()=>
      {
        res.redirect('/admin/orders')
      })

     }),
     editCatOfferGet:((req,res,next)=>
     {
      console.log(req.params.id)
     }),
     editCatOfferPost:((req,res,next)=>
     {
        console.log(req.body)
        categoryHelpers.updateCategoryOffer(req.body).then(()=>
        {
          res.redirect('/admin/Offers')
        })
     }),
     addCatOfferGet:((req,res,next)=>
     {
      console.log(req.params.id,'hiii')
     }),
     updateCatOffer:((req,res,next)=>
     {
      console.log(req.body)
      productHelpers.addCatCoupon(req.body).then(()=>
      {
        res.redirect('/admin/Offers')
      })
     }
     ),
     deleteCategoryOffer:((req,res,next)=>
     {
      console.log(req.params.id)
      productHelpers.deleteCatOffer(req.params.id).then(()=>
      {
       res.redirect('/admin/Offers') 
      })
     })
}