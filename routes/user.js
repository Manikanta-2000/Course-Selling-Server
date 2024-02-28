const express = require("express");
const router =  express.Router();
const {userMiddleware,verifyJwtToken} = require("../middlewares/user");
const {Admin,User,Course} = require("../db/index");
const bcrypt=require("bcrypt");
const saltRounds=5;
const jwt=require("jsonwebtoken");
const jwtPass="12345";
const z= require("zod");

const userSchema = z.object({
    username : z.string().email(),
    password : z.string().min(6).refine((password)=> {
        return /[A-Z]/.test(password);
    }).refine((password)=> {
        return /[^A-za-z0-9]/.test(password)
    })
})

router.post("/signup",async function(req,res){
    try{
        const response = userSchema.safeParse(req.body);
        if(!response.success){
            return res.status(400).send("Not a valid username and password");
        }
        bcrypt.hash(req.body.password,saltRounds,async function(err,hash){
            if(err) throw err;
            try{
                const createUser= await User.create({
                    username:req.body.username,
                    password: hash
                })
                res.status(201).json({
                    message : "User created succesfully"
                })
            }
            catch(error){
                if (error.code === 11000 && error.keyValue && error.keyValue.username) {
                    return res.status(400).json({
                        error: "Username already exists"
                    });
                } else {
                    console.error("MongoDB error:", error);
                    res.status(500).json({
                        error: "MongoDB error occurred"
                    });
                }
            }
        })
    }catch(err){
        console.log(err);
        res.status(500).json({
            error:err
        })
    }
})

router.post("/signin",async function(req,res){
    const username=req.body.username;
    const password=req.body.password;
    if(!username || !password){
        return res.status(403).send("username and password required");
    }
    const found=await User.findOne({username});
    if(!found) return res.status(401).send("Username not found");
    bcrypt.compare(password,found.password,function(error,result){
        if(!result) return res.status(401).send("Invalid password");
        
    })
    const token=jwt.sign({username:found.username,userId: found._id},process.env.jwtPassword,{expiresIn:"1h"});
    return res.json({
        token
    })
})

router.get("/courses",verifyJwtToken,async function(req,res){
    const allCourses = await Course.find({});
    if(!allCourses) return res.status(200).send("No courses created");
    res.json(allCourses);
})

router.post("/courses/:courseId",verifyJwtToken,async function(req,res){
    try{
        const courseID = req.params.courseId;
        const found = await Course.findById(courseID);
            if(!found) res.send("invalid course id");
        let userId=req.userPayLoad.userId;
        let user = await User.findById(userId);
        let purchased = user.courses.filter(function(id){
            return id.equals(courseID);
        })
        if(purchased.length!=0) return res.send("Course already purchased");
        user.courses.push(found._id);
        const updated = await User.findByIdAndUpdate(userId,{courses:user.courses});
        res.json({
            message : "Course purchased successfully"
        })
     }catch(error){
            console.log(error);
            res.send("Internal server error")
        }
})
router.get("/purchasedCourses",verifyJwtToken,async function(req,res){
    let userId=req.userPayLoad.userId;
    const userCourses=await User.findById(userId);
    const courses= await Course.find({_id:{$in:userCourses.courses}})
    res.status(200).json({
        courses
    });
})

module.exports=router;