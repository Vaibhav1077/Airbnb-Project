if(process.env.NODE_ENV!=="production"){
    require("dotenv").config();
}

const express=require('express');
const app=express();
const cors=require('cors');
const helmet=require('helmet');
const methodOverride=require('method-override');
const connection=require('./models/connection.js');
const ejsmate=require('ejs-mate')
const expressError=require('./utils/expressError.js');
const listingRouter=require('./routes/listings.js')
const reviewRouter=require('./routes/reviews.js');
const userRouter=require('./routes/user.js');
const bookingRouter=require('./routes/booking.js');
const session=require('express-session');
const MongoStore=require('connect-mongo');
const flash=require('connect-flash');
const passport = require('passport');
const LocalStrategy=require('passport-local');
const User=require('./models/user_schema.js');
const apiRouter=require('./routes/api.js');

let mongo_url=process.env.mongo_atlas_url;

const port=Number(process.env.PORT) || 3000;
connection();
//all used method are written here
if(process.env.NODE_ENV === 'production'){
    app.set('trust proxy', 1);
}
app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials:true
}));
app.use(helmet({
    contentSecurityPolicy: false, // disabled to allow EJS views to load external images/scripts
    crossOriginEmbedderPolicy: false,
}));
app.use(express.static('public'));
app.engine('ejs',ejsmate);
app.set('view engine','ejs');
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


// we use this(store) when we render the site online =>

const store=MongoStore.create({
    mongoUrl:mongo_url,
    touchAfter:24*60*60 //in seconds
});
store.on("error",(err)=>{
    console.log("Error in mongo session store ",err);
});

const sessionOptions={
    store:store,
    secret:process.env.MYSECRET,
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:7*24*60*60*1000,
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    }
}

app.use(session(sessionOptions));
app.use(flash());

//user authentication basic code
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currUser=req.user || null;
    next();
})

//health check endpoint
app.get('/health',(req,res)=>{
    res.json({ status:'ok', uptime:process.uptime() });
})

//root route
app.get('/',(req,res)=>{
    res.redirect('/listings');
})

//routes
app.use('/api',apiRouter);
app.use('/listings',listingRouter);
app.use('/listings/:id/review',reviewRouter);
app.use('/',userRouter);
app.use('/booking',bookingRouter);


//Rest routes
app.all('*',(req,res,next)=>{
    // Return JSON for API requests
    if(req.originalUrl.startsWith('/api')){
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    next(new expressError(404,'page not found'));
})

// handling error by custom middleware
app.use((err,req,res,next)=>{
   if(res.headersSent){
       return next(err);
   }
   let {statusCode=500,message='Something went wrong'}=err;
   // Return JSON for API requests
   if(req.originalUrl.startsWith('/api')){
       // Only expose message for client errors (4xx), hide details for server errors (5xx)
       const safeMessage = statusCode < 500 ? message : 'Internal server error';
       return res.status(statusCode).json({ error: safeMessage });
   }
   res.render('listings/error.ejs',{message});
})

// checking port
app.listen(port,()=>{
    console.log(`app is listening on port ${port}`);
});
