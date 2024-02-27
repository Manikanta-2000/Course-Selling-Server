const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user")

app.use(bodyParser.json());
app.use("/admin",adminRouter);
app.use("/users",userRouter);










app.listen(3000,function(){
    console.log("Listening on 3000");
})