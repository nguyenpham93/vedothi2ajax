/**
 * Created by techmaster on 2/11/17.
 */
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const bodyParser = require("body-parser");
const plotly = require('plotly')('tungpt7', 'nMEIrgmKOzhOs7WjNBdw');
const fs = require('fs');
const math = require('./math/hambac2');
const path = require('path');
const shortid = require('shortid');
const Promise = require('bluebird');

//Cấu hình nunjucks
nunjucks.configure('views', {
  autoescape: true,
  cache: false,
  express: app,
  watch: true
});


app.use('/public', express.static('public'));


// parse application/x-www-form-urlencoded
// for easier testing with Postman or plain HTML forms
app.use(bodyParser.urlencoded({
  extended: true
}));


// Set Nunjucks as rendering engine for pages with .html suffix
app.engine('html', nunjucks.render);
app.set('view engine', 'html');

app.get('/', async(req, res) => {
  res.render('index2.html', {'a': 2, 'b': -10, 'c': 7});
});

/***
 * Hàm hứng post request sử dụng kỹ thuật async - await. Để chạy thử node --harmony-async-await asynawait.js
 * app.post('/', async(req, res) => {...}
 * filePath = await renderChart(a, b, c);
 */
app.post('/', async(req, res) => {
  try {
    [a, b, c] = math.validate_abc(req.body.a, req.body.b, req.body.c);
  } catch (err) {
    res.send(`validate_abc failed: ${err}`);
    return;
  }
  try {
    result = await renderChart(a, b, c);
    res.render('index2.html', {'a': a, 'b': b, 'c': c, 'filePath': result[0],'x1' : result[1], 'x2' : result[2]});
  } catch (err) {
    res.send(`Error Render Chat: ${err}`);
  }

});

app.listen(5000, () => {
  console.log('Web app async-await listens at port 5000');
});

/***
 * Logic tính toán và sinh ảnh đã được gói trong lời hứa trả về
 * @param a
 * @param b
 * @param c
 */
function renderChart(a, b, c) {
  return new Promise((resolve, reject) => {
    let x_series, y_series;
    try {
      [x_series, y_series,x1,x2] = math.gendata(a, b, c);
    } catch (err) {
      reject(`math.gendata failed: ${err}`);
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
      if (error) {
        reject(`plotly.getImage failed: ${error}`);
      }

      let uniqueid = shortid.generate();
      let filePath = `/public/${uniqueid}.png`;
      let fullfilePath = __dirname.concat(filePath);
      console.log(fullfilePath);

      let fileStream = fs.createWriteStream(fullfilePath);
      imageStream.pipe(fileStream);
      resolve([filePath,x1,x2]);
    });

  });
}