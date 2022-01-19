// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Item = require("./models/Item");
const inf = require("./models/Information");
const Kredi = require("./models/KrediKartı");
const sToDo = require("./models/SilinenToDo");
const port = process.env.PORT || 5000

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middlewares/auth");

// app
const app = express();

// passport initialization
const initializePassport = require("./passport-config");
initializePassport(
  passport,
  async (email) => {
    const userFound = await User.findOne({ email });
    return userFound;
  },
  async (id) => {
    const userFound = await User.findOne({ _id: id });
    return userFound;
  }
);

// configurations
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static("public"));

// routes
app.get("/", checkAuthenticated, async (req, res) => {
  const items = await Item.find({ userId: req.user._id });
  const stodos = await sToDo.find({ userId: req.user._id });

  res.render("index", { name: req.user.name, items, stodos });
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post("/register", checkNotAuthenticated, async (req, res) => {
  const userFound = await User.findOne({
    email: req.body.email,
  });

  if (
    req.body.email === "" ||
    req.body.name === "" ||
    req.body.password === "" ||
    req.body.adress === "" ||
    req.body.KKarti === ""
  ) {
    req.flash("error", "Tum alanlar doldurulmalı");
    res.redirect("/register");
  } else if (userFound) {
    req.flash("error", "Bu emaile sahip kullanıcı mevcut");
    res.redirect("/register");
  } else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      await user.save();

      var name = req.body.name;
      User.findOne({name: new RegExp('^'+name+'$', "i")}, function(err, doc) {
        var a = user._id
      
        const Inf = new inf({
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
          address: req.body.adress,
          Id: a,
        });
  
        Inf.save();
  
        const kredi = new Kredi({
          Number: req.body.KKarti,
          Id: a,
        });
        kredi.save();
      });
      


      res.redirect("/login");
    } catch (error) {
      console.log(error);
      res.redirect("register");
    }
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

app.post("/add", checkAuthenticated, async (req, res) => {
  try {
    const item = new Item({
      title: req.body.todo,
      userId: req.user._id,
    });

    await item.save();

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/:id/delete", checkAuthenticated, async (req, res) => {
  try {
    var id = req.params.id;
    Item.findById(id, function (err, docs) {
        if (err){
            console.log(err);
        }
        else{
            console.log("Result : ", docs.title, docs.userId);
            
            const stodo = new sToDo({
              title: docs.title,
              userId: docs.userId,
           });
          stodo.save();
        }
    });

    await Item.findByIdAndDelete(req.params.id);
    await sToDo.findByIdAndDelete(req.params.id);

    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

//404
app.get("*", (req, res) => {
  res.render("404", {title: "404 Sayfası"})
})

// mongodb connection and listening for connections on PORT: 3000
mongoose
  .connect("mongodb+srv://dogukan:dogukan1@cluster0.ga8mi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log("Server is running on Port ${port}");
    });
  });
