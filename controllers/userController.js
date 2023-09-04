const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const randomString = require('randomstring')
const config = require('../config/config')


const secPassword= async(password)=>{
    try {
        const passHash = await bcrypt.hash(password,10)
        return passHash;
    } catch (error) {
        console.log(error.message)
    }
}



//////////////////////////////////////////////////////////////////////////////
    // THE EMAIL VARIFICATION CODE START FROM HERE 
////////////////////////////////////////////////////////////////////////////
const emailVarifyMethod=(name,email,user_id)=>{

  try {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email', // Corrected typo here
        port: 587,
        
        auth: {
            user: config.emailVr,
            pass: config.emailPassword
        }
    });
    

    const mailOption={
        from:'naveedkhankpk1997@gmail.com',
        to:email,
        subject:'For varification email ',
        html:'<p> Hi '+name+' Please click here to <a href="http://localhost:8000/verify?id='+user_id+'">Varify broo</a></p>'
    }

    transporter.sendMail(mailOption, (error, info) => {
        if (error) {
            console.log("Error in sending verification email:", error.message);
        } else {
            console.log(`Email sent successfully with id ${info.response}`);
        }
    });
  } catch (error) {
    console.log(error.message);
  }


}

const verifyEmail = async (req,res)=>{
    try {
        const id = req.query.id;
        // console.log(`this is the id ${id}`)
        const updatedinfo = await User.updateOne({_id:req.query.id},{$set:{
            is_varified:1}})
        // console.log(updatedinfo)
        res.render("email-verified")
    } catch (error) {
        console.log(error.message)
    }
    
}
//////////////////////////////////////////////////////////////////////////////
    // THE EMAIL VARIFICATION CODE END HERE 
////////////////////////////////////////////////////////////////////////////


const loadRegister = async(req,res)=>{
    try{

        res.render('registeration')
    }catch(error){
        res.send(error.message)
    }
}


const insertUser = async (req,res)=>{
    try {
        const sPassword = await secPassword(req.body.password)
        const user = new User({
               name:req.body.name,
               email:req.body.email,
               mobile:req.body.mobile,
               image:req.file.filename,
              
               password:sPassword,
               is_admin:0
            })
            const userData = await user.save();
            if(userData){
                emailVarifyMethod(req.body.name,req.body.email,userData._id)
                res.render("registeration",{message:"ok done , Now you have to varify your email"});
            }else{
                res.render("registeration",{message:"try again broo "});
            }
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin =(req,res)=>{

    // res.render("login");
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }

}

const varifyLogin = async(req,res)=>{
     
    try {
        const email = req.body.email;
        console.log(email)
        const password = req.body.password;
        
        const userData = await User.findOne({email:email})

        if(userData){
            const passwordMatch =await  bcrypt.compare(password,userData.password)
            
            if(passwordMatch){
                if(userData.is_varified === 0){
                    res.render("login",{message:"Please varify your email"})
                }else{
                    req.session.user_id =userData._id
                    res.redirect('home')
                }
           }else{
            res.render("login",{message:"Email or password are incorect"})
           }

        }else{
           
            res.render("login",{message:"Email or password are incorect"})
        }

    }catch (error) {
        console.log(error.message)
    }

}

const loadHome = async(req,res)=>{
   try {
    res.render('home')
   } catch (error) {
    console.log(error.message)
   }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
        
    } catch (error) {
        console.log(error.message)
    }
}

//////////////////////////////////////////////////////////////////
            //  FORGET PASSWORD 
//////////////////////////////////////////////////////////////////


const forgetLoad = async(req,res)=>{
        try{
            res.render('forget')
         } catch (error) {
            console.log(error.message)
         }
}


const forgetPassword =async (req,res)=>{

    try {
       const  email = req.body.email;
       const userData = await User.findOne({email:email})
       if(userData){
       
        if(userData.is_varified===0){
            res.render('forget',{message:"Varify Your Email first"})
        }else{
            const randString = randomString.generate()
            const updatedDate =await  User.updateOne({email:email},{$set:{token:randString}})
            forRestPasswordMethod(userData.name,userData.email,randString)
            res.render('forget',{message:"Please check your mail to reset Password"})
        }
        
       }else{
        res.render('forget',{message:"Email is incorrect try again"})
       }

    } catch (error) {
        console.log(error.message)
    }

}


//////////////////////////////////////////////////////////////////////////////
    // RESET PASSWORD CODE START FROM HERE 
////////////////////////////////////////////////////////////////////////////
const forRestPasswordMethod=(name,email,token)=>{

    try {
      const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email', // Corrected typo here
          port: 587,
          
          auth: {
              user: config.emailVr,
              pass: config.emailPassword
          }
      });
      
  
      const mailOption={
          from:'naveedkhankpk1997@gmail.com',
          to:email,
          subject:'For Reset Password ',
          html:'<p> Hi '+name+' Please click here to <a href="http://localhost:8000/forget-password?token='+token+'">Reset  </a>Your passwrod</p>'
      }
  
      transporter.sendMail(mailOption, (error, info) => {
          if (error) {
              console.log("Error in sending verification email:", error.message);
          } else {
              console.log(`Email sent successfully with id ${info.response}`);
          }
      });
    } catch (error) {
      console.log(error.message);
    }
  
  
  }
  
  const forgetPasswordLoad = async(req,res)=>{

    try {
        const token = req.query.token;
      
        const tokenData = await User.findOne({token:token})
        console.log(tokenData)
        if(tokenData){
           res.render('forget-password',{user_id:tokenData._id});

        }else{
            res.render("404",{message:"Ivailed token try again"})
        }

    } catch (error) {
        
        console.log(error.message)
    }
  }

  const restPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secPasswordUpdate = await secPassword(password);

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: { password: secPasswordUpdate, token: '' } },
            { new: true } // This option ensures you get the updated document
        ).exec();

        console.log(updatedUser); // This should show the updated user

        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////////////////////////////////
        //  FORGET EMAIL END HERE 
//////////////////////////////////////////////////////////////










//////////////////////////////////////////////////////////////
        //  LINK FOR VARIFCATION EMAIL START FROM HERE 
//////////////////////////////////////////////////////////////



const varificationLoad = async (req, res) => {
    try {
       res.render('./varification')
    } catch (error) {
        console.log(error.message);
    }
}

const varificationLink = async (req, res) => {
    try {
        const email = req.body.email;

        const userData = await User.findOne({ email: email }); // Use findOne to get a single user
        console.log(userData);

        if (userData) {
            await emailVarifyMethod(userData.name, userData.email, userData._id);
            res.render('./varification', {
                message: "Reset verification email sent to your email. Please check your email."
                 
            });

            console.log("okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk")
        } else {
            res.render('./varification', { message: "This email does not exist." });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"); // Add an error response
    }
}


module.exports={
    loadRegister,
    insertUser,
    verifyEmail,
    loadLogin,
    varifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetPassword,
   forgetPasswordLoad,
   restPassword,
   varificationLoad,
   varificationLink

}