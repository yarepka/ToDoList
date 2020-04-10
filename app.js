const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();


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

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = mongoose.Schema(
    {
        name: String
    }
);

const Item = mongoose.model("Item", itemsSchema);

app.get("/", (req, res) => {

    Item.find({}, (err, foundItems)=>{
        if(foundItems.length === 0) {
            const item1 = new Item({name: "Welcome to your todolist!"});
            const item2 = new Item ({name: "Hit the + button to add a new item."});
            const item3 = new Item ({name: "<-- Hit this to delete an item."});
            Item.insertMany([item1, item2, item3], (err) => {
                if(err) console.log(err);
                else console.log("Succesfully saved default items to the todolistDB");
            }) ;
            res.redirect("/");
        }
        res.render("list", { tasks: {title:"Today", list: foundItems}});
    });

    
});

app.post("/", (req, res) => {
    const itemName = req.body.task;
    
    const item = new Item({name: itemName});
    item.save();

    res.redirect("/");
});

app.post("/delete/:_id", (req, res) => {
    console.log(req.params._id);
    const id = req.params._id;
    // if u don't specify callback function, then it will find element by id
    // and return it, but not remove it.
    Item.findByIdAndRemove(id, (err) => {
            if(err) console.log("Error while deleting element with _id: " + id + ", error: " + err);
            else console.log("Succesfully deleted element with _id: " + id);
        }
    );
    res.redirect("/");
});


app.get("/work", (req, res) => {
    const tasks = {
        title: "Work List",
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