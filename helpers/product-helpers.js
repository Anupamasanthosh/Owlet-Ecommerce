var db=require('../config/connection')
var collection=require('../config/collection')
var objectId=require('mongodb').ObjectId
const { response, off, request } = require('../app')
module.exports={
    addProduct: (product,proImages,price) => {
        console.log('productsssss',proImages)
        return new Promise((resolve,reject)=>
        {
        console.log(price)
        // product.Category=objectId(product.Category)
        product.actualPrice=parseInt(price)
        console.log(product.actualPrice,'kh')
        console.log('hello',product)
        product.images=proImages.map(f=>({fileName:f.filename}))
        db.get().collection('product').insertOne(product)

           resolve()

        })
        
    },
   
    getAllProduct:()=>
    {
       
        return new Promise(async(resolve,reject)=>
        {
            let product=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
           
            resolve(product)
        })
       
    },
    deleteProduct: (proId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) }).then((response) => {
                resolve(response)
            })
        })

    },
    getAllProductDetails:(proId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId)}).then((product) => {
                resolve(product)
                
            })
        })
    },
    updateProduct:(proId,proDetails,actualprice)=>
    {
        console.log(proDetails)
        return new Promise((resolve, reject) => {
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: objectId(proId)},{
            $set:{
                Name:proDetails.Name,
                Description:proDetails.Description,
                Price:proDetails.Price,
                Category:proDetails.Category,
                brand:proDetails.Brand,
                offers:proDetails.offers,
                Quantity:proDetails.Quantity,
                actualPrice:parseInt(actualprice)


            }}).then((response) => {
                console.log(response)
            resolve()
        })
    })
    },
    updateImage:(proId,proImages)=>
    {
        return new Promise((resolve,reject)=>
        {
            
            console.log('this is proImages',proImages)
            
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: objectId(proId)},{
            $set:{
                images:proImages.map(f=>({fileName:f.filename}))
            }


        }).then((response)=>
        {
            console.log(response)
            resolve()
        })
        })
    },
    addCoupons:(coupons)=>
    {
        return new Promise((resolve,reject)=>
        {
            console.log(coupons)
            let couponObj=
            {
                Code:coupons.code,
                Discount:parseInt(coupons.Discount),
                Minimum:parseInt(coupons.Minimum),
                From:coupons.from,
                To:coupons.to
            }
            db.get().collection('coupons').insertOne(couponObj)
            resolve()
        })
    },
    viewAllCoupons:(()=>
    {
        return new Promise(async(resolve,reject)=>
        {
            let coupons=await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons)
        })
    }),
    findCoupon:((couponId)=>
    {
        return new Promise(async (resolve,reject)=>
        {
            let coupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:objectId(couponId)})
            resolve(coupon)
        })
    }),
    updateCoupon:((coupon,id)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(id)},
            {
                $set:
                {
                    Code:coupon.code,
                    Discount:coupon.Discount,
                    Minimum:parseInt(coupon.Minimum),
                    From:coupon.from,
                    To:coupon.to   
                }
            }).then((response)=>
            {
                resolve()
            })
        })
    }),
    deleteCoupon:((couponId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>
            {
                resolve()
            })
        })
    }),
    findCouponCode:((coupondata)=>
    {
        
        return new Promise(async(resolve,reject)=>
        {
           let coupon=await db.get().collection(collection.COUPON_COLLECTION).findOne({Code:coupondata})
          
            resolve(coupon)
        })
    }),
    updateOffer:((offerBody)=>
    {
        return new Promise((resolve,reject)=>
        {
           db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(offerBody.Product)}).then((product)=>
           {
            
            let price=product.Price
            let offer=parseInt(offerBody.productDiscount)
            
            let sellingPrice=(price*offer)/100
            
            actualprice=price-sellingPrice
            
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(offerBody.Product)},
            {
                $set:
                {
                    offers:offerBody.productDiscount,
                    actualPrice:parseInt(actualprice)
                }
            })
            resolve()
           })
        })
    }),
    deleteOffer:((productId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(productId)}).then((product)=>
            {
            console.log(product,'huray')
            let price=product.Price
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(productId)},
            {
                $set:{offers:'',
                actualPrice:parseInt(price)
            }
            })
            resolve()
        })
        })
    }),
    addOffer:((offer)=>
    {
        console.log(offer)
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(offer.Product)}).then((product)=>
            {
                let price=product.Price
                console.log(price)
                let offers=parseInt(offer.productDiscount)
                console.log(offers)
                let sellingPrice=(price*offers)/100
                console.log(sellingPrice)
                let actualprice=price-sellingPrice
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(offer.Product)},
                    {
                        $set:
                            {
                                offers:offer.productDiscount,
                                actualPrice:parseInt(actualprice)
                            }
                    })
                    resolve()
            })
            
        })
    }),
    addBrand:((brand,brandImage)=>
    {
        console.log(brand,brandImage)
        brand.Imgaes=brandImage.filename
        return new Promise((resolve,reject)=>
        {
           db.get().collection('brand').insertOne(brand)
           resolve()
        })
    }),
    findAllBrands:(()=>
    {
        return new Promise((resolve,reject)=>{
          let brands=db.get().collection(collection.BRAND_COLLECTION).find().toArray()
          resolve(brands)
        })
    }),
    findBrand:((brandId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            let brand=await db.get().collection(collection.BRAND_COLLECTION).findOne({_id:objectId(brandId)})
            resolve(brand)
        })
    }),
    updateBrandImage:((brandId,brandImage)=>
    {
        console.log(brandId,brandImage)
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.BRAND_COLLECTION).updateOne({_id:objectId(brandId)},
            {
                $set:{
                    Imgaes:brandImage.filename
                }
            }).then((response)=>
            {
                resolve()
            })
        })
    }),
    updateBrand:((brandId,brands)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.BRAND_COLLECTION).findOne({_id:objectId(brandId)}).then((brand)=>
            {
                console.log(brand)
                db.get().collection(collection.BRAND_COLLECTION).updateOne({_id:objectId(brandId)},
                {
                    $set:
                    {
                        Name:brands.Name
                    }
                })
                resolve()
            })
        })
    }),
    deleteBrand:((brandId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({_id:objectId(brandId)}).then(()=>
            {
                resolve()
            })
        })
    }),
    findProduct:((brandName)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            let brandProduct=await db.get().collection(collection.PRODUCT_COLLECTION).find({brand:brandName}).toArray()
            console.log(brandProduct)
            resolve(brandProduct)
        })
    }),
    findBrandName:((brandName)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            let brand=await db.get().collection(collection.BRAND_COLLECTION).findOne({Name:brandName})
            resolve(brand)
        })
    }),
    updateReturn:((request)=>
    {
        console.log(request)
        let orderId=request.OrderID
        let reason=request.code
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(orderId)}).then((order)=>
            {
                console.log(order)
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
                {
                    $set:
                    {
                        Reason:reason
                    }
                }).then(()=>
                {
                    resolve()
                })
            })
        })
    }),
    updateReviewStatus:((requestId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(requestId)}).then((order)=>
            {
                console.log(order)
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(requestId)},
                {
                    $set:
                    {
                        reasonApproved:true
                    }
                }).then(()=>
                {
                    resolve()
                })
            })
        })
    }),
    updateReviewStatusReject:((requestId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.ORDER_COLLECTION).findOne({_id:objectId(requestId)}).then((order)=>
            {
                console.log(order)
                db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(requestId)},
                {
                    $set:
                    {
                        reasonApproved:false
                    }
                }).then(()=>
                {
                    resolve()
                })
            })
        })
    }),
    addCatCoupon:((offer)=>
    {
        return new Promise((resolve,reject)=>
        {
            let id=offer.Product
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(id)}).then(()=>
            {
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(id)},
                {
                    $set:
                    {
                        offer:offer.CategoryDiscount
                    }
                }).then(()=>
                {
                    resolve()
                })
            })
        })
    }),
    deleteCatOffer:((offerId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(offerId)}).then((category)=>
            {
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(offerId)},
                {
                    $set:
                    {
                        offer:''
                    }
                }).then(()=>
                {
                    resolve()
                })
            })
        })
    })
}