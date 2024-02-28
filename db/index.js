const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect('mongodb+srv://admin:Manikantaganti%402000@cluster0.thjn6u0.mongodb.net/');

// Define schemas
const AdminSchema = new mongoose.Schema({
    // Schema definition here
    username : {
        type : String,
        unique: true
    },
    password: {
        type: String
    }
});

const UserSchema = new mongoose.Schema({
    // Schema definition here
    username : {
        type : String,
        unique:true,
        required:[true,"username is required"]
    },
    password: {
        type: String,
        required:[true,"password is required"]
    },
    courses : [{
        type:mongoose.Schema.Types.ObjectId,
        ref : "Course"
    }]
});

const CourseSchema = new mongoose.Schema({
    // Schema definition here
    title:String,
    description:String,
    price:Number,
    imageLink:String
});

const Admin = mongoose.model('Admin', AdminSchema);
const User = mongoose.model('User', UserSchema);
const Course = mongoose.model('Course', CourseSchema);

module.exports = {
    Admin,
    User,
    Course
}