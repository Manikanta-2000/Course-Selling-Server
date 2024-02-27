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

router.post("/signin",userMiddleware,function(req,res){
    const token=jwt.sign({username:req.body.username},jwtPass,{expiresIn:"1h"});
    res.json({
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
        let user = await User.findOne({username : req.headers.username});
        user.courses.push(found);
        const updated = await User.findOneAndUpdate({username : req.headers.username},{courses:user.courses});
        res.json({
            message : "Course purchased successfully"
        })
     }catch(error){
            console.log(error);
            res.send("Internal server error")
        }
})
router.get("/purchasedCourses",verifyJwtToken,async function(req,res){
    const userCourses=await User.findOne({username:req.headers.username});
    res.status(200).json({
        courses : userCourses.courses
    });
})

module.exports=router;