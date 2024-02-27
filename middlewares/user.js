//Middleware for handling authentication\
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const jwtPass="12345";
const { Admin, User, Course } = require("../db/index");
async function userMiddleware(req,res,next){
    const username=req.body.username;
    const password=req.body.password;
    if(!username || !password){
        return res.status(403).send("username and password required");
    }
    const found=await User.findOne({username});
    if(!found) return res.status(401).send("Username not found");
    bcrypt.compare(password,found.password,function(error,result){
        if(!result) return res.status(401).send("Invalid password");
        next();
    })
}

function verifyJwtToken(req,res,next){
    const bearer=req.headers.authorization;
    if(!bearer) return res.send("Bearer token required");
    const token=bearer.slice(7);
    try{
        jwt.verify(token,jwtPass);
        next();
    }
    catch(error){
        return res.send("Invalid token");
    }

}
module.exports={userMiddleware,verifyJwtToken}