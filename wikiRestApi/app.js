// Requirements (Packages Imports)
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// Setting url to "wikiDB" MongoDB database
const url = process.env.DB_URL;
// Connecting to database
mongoose.connect(url, {useNewUrlParser: true});
// Referencing 'mongoose.Schema' for less typing
const Schema = mongoose.Schema;
// Creating new schema (structure) for article object
const articleSchema = new Schema
({
    title: {type: String, required: true},
    content: {type: String, required: true}
});
// Creating model (works like a constructor for article objects) for article schema
const Article = mongoose.model("Article", articleSchema);

const port = 8000;
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Handle GET request for /articles
app.get("/articles",async function(req, res) 
{
    try 
    {
        // Querying for all articles
        const articles = await Article.find();
        console.log(articles);
        // Sending back articles to client
        res.send(articles);
    }
    catch(error)
    {
        handleError(error,res);
    }
})
.post("/articles", async function(req, res) // Handle POST request for /articles
{
    try
    {
        const title = req.body.title;
        const content = req.body.content;
        // Saves new article
        await Article({title: title, content: content}).save();
        console.log(`Added new article with title ${title}`);
        // Sends client success confirmation
        res.send(`Successfuly added article with title ${title}\n`);
    }
    catch(error)
    {
        handleError(error,res);
    }
})
.delete("/articles", async function(req, res) // Handle DELETE request for /articles
{
    try
    {
        await Article.deleteMany({});
        console.log("Deleted all articles");
        res.send("All articles have been deleted\n");
    }
    catch(error)
    {
        handleError(error,res);
    }
});

app.get("/articles/:title", async function(req, res)
{
    try
    {
        const title = req.params.title;
        const article = await Article.findOne({title: title});
        console.log(`Got requested article ${title}`);
        res.send(article);
    }
    catch(error)
    {
        handleError(error,res);
    }
})
.put("/articles/:title", async function(req, res)
{
    try
    {
        await Article.findOneAndUpdate({title: req.params.title}, {title: req.body.title, content: req.body.content});
        console.log(`Updated requested article ${req.params.title} successfully`);
        res.send(`Updated requested article ${req.params.title} successfully\n`);
    }
    catch(error)
    {
        handleError(error,res);
    }
})
.patch("/articles/:title", async function(req, res)
{
    try
    {
        await Article.findOneAndUpdate({title: req.params.title}, {$set: req.body});
        console.log(`Updated requested article ${req.params.title} successfully`);
        res.send(`Updated requested article ${req.params.title} successfully\n`);
    }
    catch(error)
    {
        handleError(error,res);
    }
})
.delete("/articles/:title", async function(req, res)
{
    try
    {
        console.log(req.body);
        await Article.findOneAndDelete({title:req.body.title});
        console.log(`Deleted requested article ${req.body.title} successfully`);
        res.send(`Deleted requested article ${req.body.title} successfully\n`);
    }
    catch(error)
    {
        handleError(error,res);
    }
});

app.listen(port, function() 
{
    console.log(`Server started on port ${port}`);
});

function handleError(error,res)
{
    console.log(error);
    // In case of error send the error back to client
    res.send(error);
}