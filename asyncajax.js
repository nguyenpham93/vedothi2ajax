const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const plotly = require('plotly')('tungpt7', 'nMEIrgmKOzhOs7WjNBdw');
const fs = require('fs');
const math = require('./math/hambac2');
const path = require('path');
const nunjucks = require('nunjucks');
const shortid = require('shortid');
const Promise = require('bluebird');

nunjucks.configure('views', {
  autoescape: true,
  cache: false,
  express: app,
  watch: true
});

app.use("/public",express.static("public"));
app.use(bodyparser.urlencoded({
    extended : true
}));
app.engine('html', nunjucks.render);
app.set('view engine', 'html');
app.get("/",(req,res) => {
    res.render("index3.html");
});
app.post('/', async(req,res) => {
    try{
        [a,b,c] = math.validate_abc(req.body.a,req.body.b,req.body.c);
    }catch(err){
        console.log(`Validate failed ${err}`);
        return;
    }
    try{
        result = await renderChart(a,b,c);
        res.json({"filePath" : result[0],"x1" : result[1], "x2" : result[2]});
    }
    catch(err){
        console.log(`Error from renderChart ${err}`);
        return;
    }
});
app.listen(7000,() => {
    console.log("Sever listen to port 7000");
});

/***
* Logic tính toán và trả về kết quả
* @param a
* @param b
& @param c
***/
function renderChart(a, b, c) {
    return new Promise((resolve,reject) => {
        let x_seriesy_series;
  try {
    [x_series, y_series,x1,x2] = math.gendata(a, b, c);
  } catch (err) {
    throw new Error('failed to generate data series');
  }

  let trace = {
    x: x_series,
    y: y_series,
    type: "scatter"
  };
  let figure = {'data': [trace]};

  let imgOpts = {
    format: 'png',
    width: 1000,
    height: 500
  };

  plotly.getImage(figure, imgOpts, function (error, imageStream) {
    if (error) return console.log(error);
    let imgid = shortid.generate();
    let filePath = `/public/${imgid}.png`;
    let fullFilePath = __dirname.concat(filePath);
    let fileStream = fs.createWriteStream(fullFilePath);
    imageStream.pipe(fileStream);
    resolve([filePath,x1,x2]);
  });
    });
}