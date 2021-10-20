const mongoose=require('mongoose');
const Campground=require('../models/campground');
const cities=require('./cities');
const {places,descriptors}=require('./seedHelpers');



mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open",()=>{
    console.log("database connected");
    });

const sample= array=> array[Math.floor(Math.random()*array.length)];

    const seedDB=async()=>{
        await Campground.deleteMany({});
        for(let i=0;i<200;i++){
            const random1000=Math.floor(Math.random()*1000);
           const camp = new Campground({
               author:'61538bba2aab8781aad10f52',
                location:`${cities[random1000].city},${cities[random1000].state}`,
                title:`${sample(descriptors)} ${sample(places)}`,
                description:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
                price:Math.floor(Math.random()*100),
                geometry:{
                    type:'Point',
                    coordinates:[cities[random1000].longitude,
                    cities[random1000].latitude]
                },
                images: [
                    {
                        url: 'https://res.cloudinary.com/geekyboi/image/upload/v1634756507/YelpCamp/ahfnenvca4tha00h2ubt_fqczfj.png',
                        filename: 'YelpCamp/ahfnenvca4tha00h2ubt_fqczfj'
                    },
                    {
                        url: 'https://res.cloudinary.com/geekyboi/image/upload/v1634756591/YelpCamp/ruyoaxgf72nzpi4y6cdi_urnlja.png',
                        filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi_urnlja'
                    }
                ]
            })
            await camp.save();
        }
    }


seedDB().then(()=>{
    mongoose.connection.close();
});