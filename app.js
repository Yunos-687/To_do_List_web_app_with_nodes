const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app =express();

mongoose.connect("mongodb+srv://yunos:list123@cluster0.tz9wl.mongodb.net/DoListDB",{useNewUrlParser:true});

const DoListItemSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});


const Hobby = mongoose.model("Hobby",DoListItemSchema);


const CustomListschema = new mongoose.Schema({
  name:String,
  items:[DoListItemSchema]
});

const List = mongoose.model("List",CustomListschema);


//reading items from db
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine","ejs");



app.get("/",function(req,res){

  let today = new Date();
  let options={
    weekday:"long",
    day:"numeric",
    month:"long"
  }
  let day = today.toLocaleDateString("esn-US",options);

//start rading

        Hobby.find(function(err,hobbies){
          if(err){
            console.log(err);
          }else{
              res.render("list",{listTitle:"today", newListItems:hobbies});
          }
        });

});


app.get("/:urlListName",function(req,res){
  const ListName = _.capitalize(req.params.urlListName);

  List.findOne({name:ListName},function(err,foundList){
    if(!err){
      if(!foundList){
        console.log("not found");
        const list = new List({
          name:ListName
        });
        list.save();
        res.redirect("/");
      }else{
        console.log("found");
        res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
      }
    }
  });
})



app.get("/about",function(req,res){
  res.render("about");
})

app.post("/",function(req,res){
  const listname = req.body.list;
  const myItem = req.body.item;

     const item = new Hobby({
       name:myItem,
     });
  if(listname === "today"){

       item.save();
      res.redirect("/");
  }else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    })
  }


});

app.post("/delete",function(req,res){
  let itemChecked = req.body.box;
  const theList = req.body.ListName;
  if(theList ==="today"){
    Hobby.findByIdAndRemove(itemChecked,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("delete one item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:theList},{$pull:{items:{_id:itemChecked}}},function(err){
      if(!err){
        res.redirect("/" + theList);
      }
    })
  }

})


app.listen(process.env.PORT||3000,function(){
  console.log("listening to port 3000");
})
