const express = require('express')
const ejs =require('ejs')
const session = require('express-session')
const config = require('../config/config')
const auth = require('../middlewares/auth');
const user_route = express()
user_route.use(session({secret:config.session_secret}))
const bodyParser = require('body-parser')
const multer = require('multer')

const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '_' + file.originalname; // Fix the typo here
        cb(null, name);
    }
});

const upload = multer({ storage: storage });
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))
user_route.set('view engine','ejs');
user_route.set('views','./views/users')

const userController =require('../controllers/userController')

// user_route.get('/login',(req,res)=>{
//     res.render('login')
// })
// user_route.get('/register',(req,res)=>{
//     res.render('register')
// })

user_route.get('/register',auth.isLogout,userController.loadRegister)
user_route.post('/register',upload.single('image'),userController.insertUser)
user_route.get('/verify',userController.verifyEmail)

// user_route.get('/login',auth.isLogout,userController.loadLogin)
user_route.get('/',auth.isLogout,userController.loadLogin)
user_route.post('/login',userController.varifyLogin)
user_route.get('/home',auth.isLogin,userController.loadHome)
user_route.get('/logout',auth.isLogin,userController.userLogout)
user_route.get('/forget',auth.isLogout,userController.forgetLoad)
user_route.post('/forget',auth.isLogout,userController.forgetPassword)
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad)
user_route.post('/forget-password',userController.restPassword)
user_route.get('/varification',userController.varificationLoad)
user_route.post('/varification',userController.varificationLink)

module.exports =user_route
