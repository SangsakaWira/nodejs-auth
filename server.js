const express = require("express")
const session = require("express-session")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const MongoDBStore = require("connect-mongodb-session")(session)
const user = require("./models/user")

const app = express()

const URI = "mongodb://localhost/shop-app"

let salt = bcrypt.genSaltSync(10);

const store = new MongoDBStore({
    uri:URI,
    collection:"sessions"
})

mongoose.connect(URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex:true 
})

app.set("view engine","ejs")
app.use(session({
    secret:"mysecret",
    resave:false,
    saveUninitialized:false,
    store:store
}))
app.use(bodyParser.urlencoded({extended:true}))

const isLoggedIn = (req,res) =>{
    if(req.session.isLoggedIn == true){
        return next()
    }
    res.redirect("/login")
}

app.get("/login",(req,res)=>{
    res.render("auth/login",{
        title:"Login",
        message:null
    })
})

app.get("/register",(req,res)=>{
    res.render("auth/register",{
        title:"Register",
        message:null
    })
})

app.get("/dashboard",(req,res)=>{
    if(req.session.isLoggedIn == true){
        res.render("dashboard",{
            title:"Dashboard"
        })
    }else{
        res.redirect("/login")
    }
})

app.post("/logout",(req,res)=>{
    req.session.isLoggedIn = false
    res.redirect("/login")
})

app.post("/login",(req,res)=>{
    user.findOne({email:req.body.email},
        (err,doc)=>{
            if(err){
                console.log(err)
                res.render("auth/login",{
                    title:"Login",
                    message:"Opps something wrong!"
                })
            }else{
                if(doc != null){
                    if(bcrypt.compareSync(req.body.password,doc.password)){
                        req.session.isLoggedIn = true
                        console.log(req.session.isLoggedIn)
                        res.redirect("/dashboard")
                    }else{
                        res.render("auth/login",{
                            title:"Login",
                            message:"Wrong Password"
                        })
                    }
                }else{
                    res.render("auth/login",{
                        title:"Login",
                        message:"No User Found"
                    })
                }
            }
    })
})

app.post("/register",(req,res)=>{
    user.create({
        username:req.body.username,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password, salt)
    },(err,doc)=>{
        if(err){
            console.log(err)
            res.render("auth/register",{
                title:"Register",
                message:"Opps something wrong!"
            })
        }else{
            res.render("auth/login",{
                title:"Login",
                message:"Register Success"
            })
        }
    })
})

app.listen(3000,()=>{
    console.log("Server is running!")
})