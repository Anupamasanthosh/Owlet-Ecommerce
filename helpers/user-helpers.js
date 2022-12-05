var db = require("../config/connection");
var collection = require("../config/collection");
const bcrypt = require("bcrypt");
const { ObjectID } = require("bson");
const { response, get } = require("../app");
const { OrderedBulkOperation } = require("mongodb");
var objectId = require("mongodb").ObjectId;
const Razorpay=require('razorpay');
const { Console, log } = require("console");
const { resolveSoa } = require("dns");
const { ORDER_COLLECTION } = require("../config/collection");
const { resolve } = require("path");

var instance = new Razorpay({
  key_id: "rzp_test_SDG175if3j6GAl",
  key_secret: "57aTfmo79BJl07mGUHaIPoNl",
});

module.exports = {
  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {
      //console.log(userData);
      userData.password = await bcrypt.hash(userData.password, 10);
      db.get().collection(collection.USER_COLLECTION).insertOne(userData);

      // console.log(response);
      resolve(userData);
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        // console.log('this is user')
        //console.log(user)
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
           
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            
            resolve({ status: false });
          }
        });
      } else {
        
        resolve({ status: false });
      }
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(user);
    });
  },
  findUser: (userEmail) => {
    return new Promise(async (resolve, reject) => {
      let UserEmail = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userEmail });
      resolve(UserEmail);
    });
  },
  blockUser: (userId, status) => {
    return new Promise(async (resolve, reject) => {
      //console.log(status)
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectID(userId) },
          {
            $set: {
              isBlocked: status,
            },
          }
        )
        .then(response);
      {
        resolve();
      }
    });
  },
  addToCart: (proId, userId) => {
    let proObj = {
      item: objectId(proId),
      quantity: 1,
    };
    
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      //console.log(user)
      console.log("usercart", userCart);
      if (userCart) {
        let productExist = userCart.product.findIndex(
          (product) => product.item == proId
        );
        console.log("pro", productExist);
        if (productExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId), "product.item": objectId(proId) },
              { $inc: { "product.$.quantity": 1 } }
            )
            .then((response) => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { product: proObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let cartObj = {
          user: objectId(userId),
          product: [proObj],

        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  getCartProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      //console.log(user)
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {
              user: objectId(userId),
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              item: "$product.item",
              quantity: "$product.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      // console.log("cart items1", cartItems);

      resolve(cartItems);
    });
  },

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: objectId(userId) });
      if (cart) {
        count = cart.product.length;
        //console.log('cart....',count)
      }
      resolve(count);
    });
  },
  changequantity: (data) => {
    let count = parseInt(data.count);
    let quantity = parseInt(data.quantity);

    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: objectId(data.cart) },
            {
              $pull: {
                product: { item: objectId(data.product) },
              },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: objectId(data.cart),
              "product.item": objectId(data.product),
            },
            {
              $inc: { "product.$.quantity": count },
            }
          )
          .then((response) => {
            resolve({ status: true });
          });
      }
    });
  },
  deleteCartProduct: (userId, proId) => {
    // console.log("this is user is,proid", userId, proId);
    return new Promise(async (resolve, reject) => {
      let deleteProduct = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { user: objectId(userId) },
          {
            $pull: {
              product: { item: objectId(proId) },
            },
          }
        );
    });
  },
  getTotalAmount: (userId) => {
    // console.log("this is uasers id sooo", userId);
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: {
              user: objectId(userId),
            },
          },
          {
            $unwind: "$product",
          },
          {
            $project: {
              item: "$product.item",
              quantity: "$product.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    "$quantity",
                    { $convert: { input: "$product.actualPrice", to: "int" } },
                  ],
                },
              },
            },
          },
        ])
        .toArray();

      resolve(total);
    });
  },
  
  placeOrder: (order, cart, total) => {
    // console.log("cart.........",cart);
    
    // console.log("cart.........", total[0].total);
    if(order.payment==='COD')
    {
      order.status='Placed'
    }
    else{
      order.status='Pending'

    }
    return new Promise(async (resolve, reject) => {
      let orderObj = {
        address: order.address,
        userId: objectId(order.user),
        
        payment: order.payment,
        products:cart,
       
        totalAmount:total,
        status: order.status,
        date: new Date().toDateString(),
      };

      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          db.get()
            .collection(collection.CART_COLLECTION)
            .deleteOne({ user: objectId(order.user) });
          resolve(response.insertedId);
        });
    });
  },
  viewOrder: (user) => {
    return new Promise(async (resolve, reject) => {
      // console.log('user from view orserr',user)
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: objectId(user) })
        .toArray();
      // console.log('orderssssssss',order)

      resolve(order);
    });
    
  },
  getOrderDetails:(orderId)=>
    {
      return new Promise(async (resolve,reject)=>
      {
        let orderDetails=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)})
       
        resolve(orderDetails)
        // console.log(orderId)
      })
     
    },
  cancelOrder: (user, orderId) => {
    return new Promise(async (resolve, reject) => {
      // console.log("user data", user);
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ userId: objectId(user) })
        .then((response) => {
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: objectId(orderId) },
              {
                $set: {
                  status: "canceled by user",
                },
              }
            )
            .then((response) => {
              resolve();
            });
        });
    });
  },
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();

      resolve(orders);
    });
  },

  viewOrderDetails: () => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      resolve(order);
    });
  },
  addAddress: (user, address) => {
    //console.log('userId',user,address)
    return new Promise((resolve, reject) => {
      let addressObj = {
        id: new objectId(),
        Address: address.address,
        Pincode: address.pincode,
        State: address.state,
        Locality: address.locality,
        City: address.city,
      };
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(user) })
        .then((response) => {
          //console.log('user',response)
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: objectId(user) },
              {
                $push: { Address: addressObj },
              }
            )
            .then((response) => {
              resolve();
            });
        });
    });
  },
  viewAddress: (addId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) })
        .then((UserData) => {
          //console.log('yaaaa',UserData)
          let Address = UserData.Address.findIndex(
            (Address) => Address.id == addId
          );

          resolve(Address);
        });
    });
  },
  ViewAllAddress: (users) => {
    return new Promise((resolve, reject) => {
      // console.log("this is users from virew", users);
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(users) })
        .then((UserData) => {
          //console.log("userDataaaaaaa", UserData);
          let address = UserData.Address;
          //console.log("address....", address);
          resolve(address);
        });
    });
  },
  updateAddress: (addressIndex, users, UpdatedAddress) => {
    return new Promise((resolve, reject) => {
      //console.log("updatedAddress", UpdatedAddress);

      console.log("addresssss", addressIndex);
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(users._id) })
        .then((response) => {
          
          let address = users.Address[addressIndex];
          console.log("addressssssssss", address);

          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { "Address.id": objectId(UpdatedAddress.id) },
              {
                $set: {
                  "Address.$.Address": UpdatedAddress.address,
                  "Address.$.Pincode": UpdatedAddress.pincode,
                  "Address.$.State": UpdatedAddress.state,
                  "Address.$.Locality": UpdatedAddress.locality,
                  "Address.$.City": UpdatedAddress.city,
                },
              }
            )
            .then((response) => {
             
              resolve();
            });
        });
    });
  },
  deleteAddress: (addressIndex, users) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(users._id) })
        .then((response) => {
          let address = users.Address[addressIndex];
         
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { "Address.id": objectId(address.id) },
              {
                $pull: {
                  Address: { id: objectId(address.id) },
                },
              }
            );
        });
    });
  },
  UpdateStatus: (orderId, updatedStatus) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) })
        .then((orders) => {
         
          let Status = updatedStatus.Status;
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: objectId(orderId) },
              {
                $set: { status: Status },
              }
            );
          resolve();
        });
    });
  },
  removeOrder: (orderId) => {
    
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) })
        .then((orderdetails) => {
          
          db.get()
            .collection(collection.ORDER_COLLECTION)
            .updateOne(
              { _id: objectId(orderId) },
              {
                $set: {
                  status: "Canceled by Admin",
                },
              }
            )
            .then((response) => {
              resolve();
            });
        });
    });
  },
  addToWishlist: (users, productId, product) => {
    let productObj = {
      id: product._id,
      isWish:true
    };
    console.log(users);
    let wishObj = {
      userId: objectId(users._id),
      products: [productObj],
    };
    return new Promise(async (resolve, reject) => {
      let userWish = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ userId: objectId(users._id) });
      if (userWish) {
        let productExist = userWish.products.findIndex(
          (products) => products.id == productId
        );
        
        if (productExist !=-1 ) {
          db.get().collection(collection.WISHLIST_COLLECTION).updateOne({userId:objectId(users._id)},
          {
            $pull:{products:{id:objectId(productId)}}
          })
        } else {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { userId: objectId(users._id) },
              {
                $push: { products: productObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishObj)
          .then((response) => {
            resolve();
          });
      }
    });
  },
  viewWishlist: (user) => {
    
    return new Promise(async (resolve, reject) => {
      let wishItems=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
        {
          $match:{
            userId:objectId(user)
          }
        },
        {
          $unwind:"$products"
        },
        {
          $project:
          {
            id:"$products.id",
            isWish:"$products.isWish"
          }
        },
        {
          $lookup:{
            from:collection.PRODUCT_COLLECTION,
            localField:'id',
            foreignField:'_id',
            as:'products'
          }
        },
        {
          $project:
          {
            id:1,
            isWish:1,
            products:{$arrayElemAt:["$products",0]}

          }
        }
      ]).toArray()
      resolve(wishItems)
      
    });
  },
  deleteWishlistProduct:((user,proId)=>
  {
    return new Promise((resolve,reject)=>
    {
      db.get().collection(collection.WISHLIST_COLLECTION).updateOne({userId:objectId(user)},
      {
        $pull:
        {
          products:{
            id:objectId(proId)
          }
        }
      })
    })
  }),
  generateRazorpay: (orderId,total) => {
    
   
    let orderid = orderId.toString();
    
    return new Promise((resolve, reject) => {
        var options = {
        amount:total*100, // amount in the smallest currency unit
        currency: "INR",
        receipt:orderid,
      };
      instance.orders.create(options, function (err, order) {
        if(err)
        {
          console.log(err)
        }
        else
        {
          
          resolve(order)
        }
        
      });
    });
  },
  verifyPayment:(orderDetails)=>
  {
     
     return new Promise((resolve,reject)=>
     {
      var crypto = require("crypto");
      var expectedSignature = crypto.createHmac('sha256', '57aTfmo79BJl07mGUHaIPoNl')
      expectedSignature.update(orderDetails['payment[razorpay_order_id]']+'|'+orderDetails['payment[razorpay_payment_id]'])
      expectedSignature=expectedSignature.digest('hex')
      if(expectedSignature===orderDetails['payment[razorpay_signature]'])
      {
        resolve()
       
      }
      else
      {
        reject()
        
      }
     })

  },
  changePaymentStatus:(orderId)=>
  {
    return new Promise((resolve,reject)=>
    {
      db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
      {
        $set:
        {
          status:'Placed'
        }
      }).then(()=>
      {
        resolve()
      })
    })
  },
  generatePaypal:(orderId)=>
  {
    console.log('hello da')
    db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
    {
      $set:
      {
        status:'Placed'
      }
    }).then((data)=>
    {
      resolve(data)
    })
  },
  getchartData: (req, res) =>
     {
        db.get().collection(collection.ORDER_COLLECTION).aggregate([
          { $match: { "status": "Placed" } },
          {
            $project: {
              date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount",payment: "$payment"
            }
          },
          {
            $match: {
              date: {
                $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 365))
              }
            }
          },
          {
            $group: {
              _id: { $month: "$date" },
              total: { $sum: "$total" },
              
            }
          },
          {
            $project: {
              month: "$_id",
              total: "$total",
              
              _id: 0
            }
          }
        ]).toArray().then(result => {
          console.log(result,'httt')
            db.get().collection(collection.ORDER_COLLECTION).aggregate([
            { $match: { "status": "Placed" } },
            {
              $project: {
                date: { $convert: { input: "$_id", to: "date" } }, total: "$totalAmount"
              }
            },
            {
              $match: {
                date: {
                  $lt: new Date(), $gt: new Date(new Date().getTime() - (24 * 60 * 60 * 1000 * 7))
                }
              }
            },
            {
              $group: {
                _id: { $dayOfWeek: "$date" },
                total: { $sum: "$total" }
              }
            },
            {
              $project: {
                date: "$_id",
                total: "$total",
                _id: 0
              }
            },
            {
              $sort: { date: 1 }
            }
          ]).toArray().then(weeklyReport => 
            {
            
            res.status(200).json({ data: result, weeklyReport })
            
          })
        })
      },
      updateReturn:((returnBody)=>
      {
        let orderId=returnBody.OrderID
        let reason=returnBody.code
        console.log(orderId)
        return new Promise((resolve,reject)=>
        {
          db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)}).then((order)=>
          {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
            {
              $set:
              {
                Reason:{reason}
              }
            }).then(()=>
            {
              resolve()
            })
          })
        })
      })
};

