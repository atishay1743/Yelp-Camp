if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
const express =require('express');
const app = express();
const path = require('path');
const mongoose=require('mongoose');
const Campground=require('./models/campground');
const methodOverride=require('method-override');
const ejsMate = require('ejs-mate');
const { nextTick } = require('process');
const {campgroundSchema ,reviewSchema }=require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi=require('joi');
const Review=require('./models/review');
const session = require('express-session');
const flash=require('connect-flash');
const passport=require('passport');
const LocalStrategy = require('passport-local');
const User=require('./models/user');
const user=require('./routes/user');
const campgrounds=require('./routes/campgrounds');
const reviews=require('./routes/reviews');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL|| 'mongodb://localhost:27017/yelp-camp';


mongoose.connect(dbUrl, {
    useNewUrlParser:  true,
 
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open",()=>{
    console.log("database connected");
    });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const secret = process.env.SECRET || 'secrethai';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    secret
});
store.on("error", function(e) {
    console.log(e);
});

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure:true,
        expires:Date.now()+1000*3600*24*7,
        maxAge:1000*3600*24*7
    }
};



app.use(session(sessionConfig));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css"

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.gstatic.com/"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/geekyboi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/',user);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews',reviews);
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',(req,res)=>{
    res.render('home');
});


app.all('*',(req,res,next)=>{
    next(new ExpressError('Not Found',404));
})


app.use((err, req,res,next)=>{
    const {statusCode=500}=err
    if(!err.message) err.message="something went wrong";
    res.status(statusCode).render('error',{err});
  
})


app.listen(3000, () => {
    console.log('Server started on port 3000');
});