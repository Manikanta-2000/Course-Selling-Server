const { Admin } = require("../db/index");
const bcrypt = require("bcrypt");
const jwt=require("jsonwebtoken");
const jwtPass="12345";

async function adminMiddleware(req,res,next){
    const username = req.body.username;
    const password = req.body.password;
    if(!username || !password){
        return res.status(403).send('username and password required');
    }
    const found = await Admin.findOne({username});
    if(!found){
        return res.status(403).send("Invalid user");
    }
    bcrypt.compare(password,found.password,function(error,result){
        if(!result) return res.status(403).send("password did not match");

        next();
    })
}

function verifyJwtToken(req,res,next){
    const bearer = req.headers.authorization;
    if(!bearer) return res.send("required bearer token");
    const token=bearer.slice(7);
    try{
        var decoded = jwt.verify(token,jwtPass);
        next();
    }
    catch(err){
        return res.send("Invalid bearer token")
    }
}

module.exports = {adminMiddleware,verifyJwtToken};
