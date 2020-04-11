const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

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

// Make Mongoose use `findByIdAndRemove()`. Note that this option is `true`
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = mongoose.Schema(
    {
        name: String
    }
);

const listSchema = mongoose.Schema(
    {
        listName: String,
        items: [itemsSchema]
    }
);

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({name: "Welcome to your todolist!"});
const item2 = new Item ({name: "Hit the + button to add a new item."});
const item3 = new Item ({name: "<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
    Item.find({}, (err, foundItems)=>{
        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, (err) => {
                if(err) console.log(err);
                else console.log("Succesfully created and saved default items to the todolistDB");
            });
            res.redirect("/");
        } else {
            res.render("list", { tasks: {title:"Today", list: foundItems}});
        }
    });
});

app.post("/", (req, res) => {
    const itemName = req.body.task;
    const listName = req.body.list;

    const item = new Item({name: itemName});

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({listName: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete/:_id", (req, res) => {
    const id = req.params._id;
    const listName = req.body.listName;
    // if u don't specify callback function, then it will find element by id
    // and return it, but not remove it.
    if(listName === "Today") {
        Item.findByIdAndRemove(id, (err) => {
                if(err) console.log("Error while deleting element with _id: " + id + ", error: " + err);
                else console.log("Succesfully deleted element with _id: " + id);
                res.redirect("/");
            }
        );
    } else {
         List.findOneAndUpdate(
            {listName: listName}, 
            {$pull: {items: {_id: id}}},
            (err, foundList) => {
                if(!err) res.redirect("/" + listName);
            }
         );
    }
});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);
    if(customListName !== "Favicon.ico") {
        List.findOne({ listName: customListName}, (err, foundList) => {
            if(!err){
                if(!foundList) {
                    console.log(customListName + " list does not exists.")
                    // Create a new list
                    const newList = new List({
                        listName: customListName,
                        items: defaultItems
                    });

                    // Insert a new created list with default items to the
                    // "todolistDB", collection "lists"
                    newList.save();
                    res.redirect("/" + customListName);
                } else {
                    res.render("list", { tasks: {title:foundList.listName, list: foundList.items}});
                }
            }    
        });
    }
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
});