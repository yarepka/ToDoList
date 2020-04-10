const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

const toDoList = [];
const workList = [];
// allows to use local .css .png .js files
// provides the path of our static files to the server
app.use(express.static("public"));

// "extended : true" allows to post nested objects
// by using bodyParser we able to parse HTTP request we get.
// By using urlencoded function we can get acces to Form Data
// which contains parameters
app.use(bodyParser.urlencoded({extended: true}));

// set up view egine
// ejs will go and look for files to
// render in views directory
// IMPORTANT: create view directory
// and put all of your view files there
app.set("view engine", "ejs");

app.get("/", (req, res) => {
    const day = date.getDate();

    // read tasks from Data base
    const tasks = {
        title: day,
        amountOfTasks: toDoList.length,
        list: toDoList
    };

    res.render("list", {tasks: tasks});
});

app.post("/", (req, res) => {
    const newTask = req.body.task;
    
    if(req.body.list === "Work") {
        workList.push(newTask);
        res.redirect("/work");
    } else {
        toDoList.push(newTask);
        res.redirect("/");
    }
});

app.get("/work", (req, res) => {
    const tasks = {
        title: "Work List",
        amountOfTasks: workList.length,
        list: workList
    };    

    res.render("list", {tasks: tasks});
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
});