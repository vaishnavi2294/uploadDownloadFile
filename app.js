var express = require('express');
var multer = require('multer');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs')
var app = express();
var passport = require('passport');
var bodyParser = require("body-parser")
   var LocalStrategy = require("passport-local")
   var passportLocalMongoose =  require("passport-local-mongoose")
    var User = require("./models/user")
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
// storage
var storage = multer.diskStorage({
    destination:function(req,file,cb){
         cb(null,'./public/uploads')
    },
    filename(req,file,cb){
        cb(null,file.originalname)
    }
})

var upload = multer({storage:storage});
// connection to DB
 mongoose.connect('mongodb://localhost:27017/file',{useNewUrlParser:true}, {useUnifiedTopology:true},
 {useFindAndModify: false},
{useCreateIndex:true})
 .then(()=>console.log('connect')).catch(err=>console.log(err))

// fileModel contain the instance of picdemo by which it can manipulate data in it.
 var fileModel = require('./models/fileschema')


// template engine
app.set('view engine','ejs');

app.set("views",path.resolve(__dirname,'views'));

var filePath = path.resolve(__dirname,'public');

app.use(express.static(filePath));
app.use('/assets',express.static('assets'));

app.use(bodyParser.urlencoded({extended:true}))


// authenication
app.use(require("express-session")({
    secret: "1234",
    resave: false,
    saveUninitialized: false
}));
 
app.use(passport.initialize());
app.use(passport.session());
 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Showing login form
app.get('/',(req,res)=>{
    res.redirect('/login')
})

app.get('/login',(req,res)=>{
               res.render('login')          
    })

    //Handling user login
app.post("/login", passport.authenticate("local", {
    successRedirect: "/home",
    failureRedirect: "/login"
}), function (req, res) {
});

// profile home page
app.get('/home',isLoggedIn,(req,res)=>{
    fileModel.find((err,data)=>{
             if(err){
                 console.log(err)
             }
            if(data){
                console.log(data)
                res.render('home',{data:data})
            } 
           else{
               res.render('home',{data:{}})
           } 
    })
    
})

app.post('/',upload.single('file'),(req,res)=>{
    var x= 'uploads/'+req.file.originalname;
    var filess = new fileModel({
        filespath:x
    })
    filess.save((err,data)=>{
         if(err){
             console.log(err)
         }
         else{
             console.log('data',data)
            res.redirect('/home')
         }
    })
})
app.get('/download/:id',(req,res)=>{
    const id = req.params.id
     fileModel.find({_id:req.params.id},(err,data)=>{
         if(err){
             console.log(err)
         } 
         else{
            var path= __dirname+'/public/'+data[0].filespath;
            res.download(path);
         }
     })

// app.get('/download/:id',(req,res)=>{
//      fileModel.find({_id:req.params.id},(err,data)=>{
//          if(err){
//              console.log(err)
//          } 
//          else{
//             var path= __dirname+'/public/'+data[0].filespath;
//             res.download(path);
//          }
//      })
})
app.get('/steptodownld/:id',upload.single('file'),(req,res)=>{
        const id = req.params.id
         
    fileModel.findById(id).then((data)=>{
        
        res.render('file_source',{data:data} )
    }).catch((err)=>{
        console.log("download page:",err)
        
    })
})

app.post('/home', upload.single('file'), (req,res)=>{

      fileModel.find({_id:req.params.id},(err,data)=>{        
       var path = __dirname+'/public/uploads';
    fs.unlink(path, (err) => {
  if (err) {
    console.error(err)
  }
  else{
      res.redirect('/home')
  }})
      })})



// Showing register form
app.get("/register", function (req, res) {
    res.render("register");
});
 
// Handling user signup
app.post("/register", function (req, res) {
    var username = req.body.username
    var password = req.body.password
    var number = req.body.number
    User.register(new User({ username: username , number:number}),
            password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
 
        passport.authenticate("local")(
            req, res, function () {
            res.redirect("/home");
        });
    });
})
 
//Handling user logout
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});
 
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}
const port =  3200 ;
app.listen(port,()=>console.log(`server running at ${port}`))
console.log('http://localhost:3200')