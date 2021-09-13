const express = require("express");
const mongoose = require("mongoose");

const connect = () => {
    return mongoose.connect("mongodb://localhost:27017/masai", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}


// create schema

const masaiSchema = new mongoose.Schema({
    student_name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: false, default: "M" },
    course: { type: String, required: true },
    status: { type: Boolean, required: true },
    batch: { type: String, required: true },
    instructor: { type: String, required: true }
    
});

const CollModel = mongoose.model("schoolcollection", masaiSchema);
//End schema



const app = express();

app.use(express.json());
const port = 2500;


// add single in a database

app.post('/student', async (req, res) => {
    const postDetails = await CollModel.create(req.body);
    res.status(201).json({ postDetails });
});


//Q:1 => fetch the all student data

app.get('/student', async (req, res) => {
    const fetchAllStudent = await CollModel.find().lean().exec();
    res.send(fetchAllStudent);
    
});

//Q:2 => find all students who are older than 18 years.

app.get('/olderdata', async (req,res) => { 
    const olderData = await CollModel.find({ age:{$gt:18}}).lean().exec();
    res.send(olderData);
});

//Q:3 find all the students who have applied for full stack web development course.

app.get('/mernapply', async (req, res) => {
    const mernApply = await CollModel.find({ course: { $eq: "MERN Stack" } });
    res.send(mernApply)
});

//Q:4 => find the number of students that are men and number of students that are women.

app.get('/countgender', async (req,res) => {
    
    const countMaleGender = await CollModel.find({ gender: { $eq: "M" } }).count();
    const countFemaleGender = await CollModel.find({ gender: { $eq: "F" } }).count();
    res.json({ "male Count":countMaleGender,"Female Count":countFemaleGender });
})



//Q:5 => find the total number of students on the site ( for e.g :- in different batches but currently studying )

app.get('/currentstudent', async (req, res) => {
    const currentStudent = await CollModel.find({ status: { $not: { $eq: false } } }).count().lean().exec();
    res.json({ "total Current student studing": currentStudent });
});


//Q:6 => find the batch which has the most students.

app.get('/batch', async (req,res) => {
    
    const batch = await CollModel.find().lean().exec();

    const batchStrength = {};

    batch.map((value) => {
        
        if (batchStrength[value.course]) {
            batchStrength[value.course] += 1;
        }
        else {
            batchStrength[value.course] = 1;
        }
    });

    res.json({ "Batch and Strength ": batchStrength });
});

//Q:7 find the instructor who is currently teaching most number of students.

app.get('/instructor', async (req, res) =>
{
    const instructorcount = await CollModel.find({ status: { $not: { $eq: false } } }).lean().exec();
    const instructorobj = {};

    instructorcount.map((val) => {
        if (instructorobj[val.instructor]) {
            instructorobj[val.instructor] += 1;
        }
        else {
            instructorobj[val.instructor] = 1;
        }
    });
    
    res.json({"Each instructor Student length which is studing currently":instructorobj});
});






app.listen(port, async () => {
    await connect();
    console.log(`Server running on port : ${port}`);
})