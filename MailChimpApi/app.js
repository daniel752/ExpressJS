const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const client = require("@mailchimp/mailchimp_marketing");

require("dotenv").config();

client.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.SERVER,
});

// Init express app
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Use static files stored in public directory
app.use(express.static("public"));

app.set("view engine", "ejs");

// Handle GET method for root path
app.get("/", function (req, res) {
  // Send signup page
  res.sendFile(`${__dirname}/signup.html`);
});

app.post("/", function (req, res) {
  console.log(req.body);
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  // Create js object
  var data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const listID = process.env.LIST_ID;
  console.log(listID);

  const run = async () => {
    try {
      const apiRes = await client.lists.batchListMembers(listID, {
        members: [
          {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              FNAME: firstName,
              LNAME: lastName,
            },
          },
        ],
      });

      if (apiRes.error_count === 0) {
        console.log(`Successfully signed new user ${firstName} ${lastName}`);
        fs.readFile(
          `${__dirname}/success.ejs`,
          "utf8",
          function (err, template) {
            if (err) {
              console.log("Error loading success.ejs page");
              res.status(500).send("Error loading success.ejs page");
            } else {
              const html = ejs.render(template, {
                firstName: firstName,
                lastName: lastName,
              });

              res.send(html);
            }
          }
        );
      } else {
        console.log(`Failed to sign ${firstName} ${lastName}`);
        res.sendFile(`${__dirname}/failure.html`);
      }
      console.log(apiRes);
    } catch (error) {
      console.log("An error occurred:", error);
      res.sendFile(`${__dirname}/failure.html`);
    }
  };

  run();
});

const port = 8000;

// Listen on specified port
app.listen(process.env.PORT || port, () => {
  console.log(`Server listening on port ${process.env.PORT || port}`);
});
