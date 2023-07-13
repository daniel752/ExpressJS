const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const fs = require("fs");
const ejs = require("ejs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Use static files in public directory
app.use(express.static("public"));

// Set EJS as the template engine
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", function (req, res) {
  console.log(req.body);
  const cityName = req.body.cityName;
  const units = req.body.selectedUnits;
  const apiKey = "626dcedc5b056a7079eca81ef59786f1";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}`;

  https.get(url, function (apiRes) {
    let weatherData = "";
    console.log(url);
    console.log(apiRes.statusCode);
    apiRes.on("data", function (data) {
      weatherData = JSON.parse(data);
      const temp = weatherData.main.temp;
      const feelsLike = weatherData.main.feels_like;
      const tempMin = weatherData.main.temp_min;
      const tempMax = weatherData.main.temp_max;
      const humidity = weatherData.main.humidity;
      const icon = weatherData.weather[0].icon;

      fs.readFile(`${__dirname}/weather.ejs`, "utf8", function (err, template) {
        if (err) {
          console.log(err);
          res.status(500).send("Error loading weather data.");
        } else {
          const renderedHTML = ejs.render(template, {
            city: cityName,
            temperature: temp,
            feelsLike: feelsLike,
            tempMin: tempMin,
            tempMax: tempMax,
            humidity: humidity,
            icon: icon,
          });

          res.send(renderedHTML);
        }
      });
    });
  });
});

const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
