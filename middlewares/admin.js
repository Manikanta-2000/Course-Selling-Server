const { Admin } = require("../db/index");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");
const jwtPass="12345";

async function adminMiddleware(req,res,next){
    
}

function verifyJwtToken(req,res,next){
    const bearer = req.headers.authorization;
    if(!bearer) return res.send("required bearer token");
    const token=bearer.split(" ")[1];
    try{
        var decoded = jwt.verify(token,jwtPass);
        req.adminpayload=decoded;
        next();
    }
    catch(err){
        return res.send("Invalid bearer token")
    }
}

module.exports = {adminMiddleware,verifyJwtToken};
