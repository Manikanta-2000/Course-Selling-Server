//Middleware for handling authentication\
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const { Admin, User, Course } = require("../db/index");
async function userMiddleware(req,res,next){
    
}

function verifyJwtToken(req,res,next){
    const bearer=req.headers.authorization;
    if(!bearer) return res.send("Bearer token required");
    const token=bearer.split(" ")[1];
    try{
        const decoded = jwt.verify(token,process.env.jwtPassword);
        req.userPayLoad=decoded;
        next();
    }
    catch(error){
        return res.send("Invalid token");
    }

}
module.exports={userMiddleware,verifyJwtToken}