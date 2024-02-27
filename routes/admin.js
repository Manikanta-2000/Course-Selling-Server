const express = require("express");
const router =  express.Router();
const { Admin, User, Course } = require("../db/index");
const {adminMiddleware ,verifyJwtToken}= require("../middlewares/admin");
const jwt=require("jsonwebtoken");
const jwtPass="12345";
const bcrypt = require("bcrypt");
const saltRounds = 10;
const z= require("zod");

const adminSchema = z.object({
    username: z.string({
        required_error: "Username is required",
        invalid_type_error: "Username must be a string",
      }).email("Must be an email"),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Paasword must be a string",
      }).min(6,"Passowrd must be atleast 6 characters").refine((password)=>{
        return /[A-Z]/.test(password)
    },{message:"Password must containn one captial letter"})
    .refine((password)=>{
        return /[^A-za-z0-9]/.test(password)
    },{message:"Must contain one special character"})
})

const courseSchema = z.object({
    title : z.string(),
    description : z.string(),
    price : z.number().nonnegative().safe(),
    imageLink:z.string().url()
}) 

router.post("/signup",async function(req,res){
    const{username,password,name} = req.body;
    const response = adminSchema.safeParse({
        username,
        password
    })
    if(!response.success){
        return res.status(400).send("Username must be an email and password must have minimum 6 character with atleast a upper case character and special character");
    }
    const isPresent = await Admin.findOne({username});
    if(isPresent){
        return res.status(400).send("Username already exists");
    }
    else{
        bcrypt.hash(req.body.password,saltRounds,async function (err,hash){
            if(err) throw err;
            const createdAdmin = await Admin.create({
                username,
                password:hash,
                name
            })
            res.status(201).json({
                message : "Admin created successfully"
            })
        })
    }
})

router.post('/signin',adminMiddleware,async (req, res) => {
    var token=jwt.sign({username:req.body.username},jwtPass,{expiresIn:"1h"});
    res.json({
        token
    })
    
});

router.post("/courses",verifyJwtToken,async function(req,res){
    const response=courseSchema.safeParse(req.body); 
    if(!response.success) return res.status(400).send("Invalid body format");
    const found = await Course.findOne({title : req.body.title});
    if(found){
        return res.status(400).send("Course name already exists");
    }
    const createdCourse = await Course.create(req.body);
    res.json({
        message: "Course created succesfully",
        courseId: createdCourse._id
    })
 
})

router.get("/courses",verifyJwtToken,async function(req,res){
    const allCourses = await Course.find({});
    if(!allCourses) return res.status(200).send("No courses created");
    res.status(200).json(allCourses);
})

module.exports=router;