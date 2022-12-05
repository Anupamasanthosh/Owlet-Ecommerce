const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done)
{
    const url='mongodb+srv://Anupama:PassForMongo123@cluster0.h3ujijh.mongodb.net/test'
    const dbname='Apple'
    console.log(dbname)
    mongoClient.connect(url,(err,data)=>
    {
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}
module.exports.get=function()
{
    return state.db
}