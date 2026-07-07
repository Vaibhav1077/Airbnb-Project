const mongoose=require('mongoose');

let builtconnection= async ()=>{
    let mongo_url=process.env.mongo_atlas_url;
    if(!mongo_url){
        console.error('Missing mongo_atlas_url in environment. Set it in Airbnb/.env');
        process.exit(1);
    }
    await mongoose.connect(mongo_url);
    console.log('MongoDB connection successful');
}

module.exports=builtconnection;
 
