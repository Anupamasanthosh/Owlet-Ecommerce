var db=require('../config/connection')
var collection=require('../config/collection')
const { response } = require('../app')
var objectId=require('mongodb').ObjectId

module.exports={
    addCategory: (category,catImages) => {
        console.log('category',category)
        console.log('cat',catImages)
        return new Promise((resolve,reject)=>
        {
            console.log('this is category',category)
            category.images=catImages.filename
            category.offer=parseInt(category.offer)
            db.get().collection('category').insertOne(category)
                
                resolve()
    
            
        })
        
    },
   
    getAllCategory:()=>
    {
        return new Promise(async(resolve,reject)=>
        {
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    getAllCategoryDetails:(catId)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: objectId(catId) }).then((category) => {
                console.log('catego',category)
                resolve(category)
            })
        })
    },
    updateCategory:(catId,catDetails)=>
    {
        console.log(catDetails)
        return new Promise((resolve, reject) => {
        db.get().collection(collection.CATEGORY_COLLECTION)
        .updateOne({ _id: objectId(catId)},{
            $set:{
                Name:catDetails.Name,
                Description:catDetails.Description,
                offer:parseInt(catDetails.offer)


            }}).then((response) => {
            resolve()
        })
    })
    
    },
    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) }).then((response) => {
                resolve(response)
            })

        })

    },
    getCategoryProducts:(catName)=>
    {
        return new Promise(async (resolve,reject)=>
        {
            let catProducts=await db.get().collection(collection.PRODUCT_COLLECTION).find({Category:catName}).toArray()
            console.log('category',catProducts)
            resolve(catProducts)
        })
        
    },
    updateImage:(catId,catImages)=>
    {
        return new Promise((resolve,reject)=>
        {
            console.log('heeyyyyaaaa',catImages)
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(catId)},
            {
                $set:{
                    images:catImages.filename
                }
            }).then((response)=>
            {
                resolve()
            })
        })
    },
    getCategoryDetails:(catName)=>
    {
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({Name:catName}).then((category)=>
            {
                resolve(category)
            })
        })
    },
    updateCategoryOffer:((offer)=>
    {
        console.log(offer)
        let id=offer.Category
        return new Promise((resolve,reject)=>
        {
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(id)}).then((category)=>
            {
               db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id:objectId(id)},
               {
                $set:
                {
                    offer:parseInt(offer.categoryDiscount)
                }
               }).then(()=>
               {
                resolve()
               })
            })
        })
    })

}