const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const bodyParser = require("body-parser");
const plotly = require('plotly')('tungpt7', 'nMEIrgmKOzhOs7WjNBdw');
const fs = require('fs');
const math = require('./math/hambac2');
const path = require('path');

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

app.get('/', (req, res) => {
  res.render('index.html', {'a': 2, 'b': -10, 'c': 7});
});


app.post('/', (req, res) => {
  try {
    [a, b, c] = math.validate_abc(req.body.a, req.body.b, req.body.c);
  } catch (err) {
    res.send(`validate_abc failed: ${err}`);
    return;
  }

  renderChart(a, b, c)
    .then(() => {
      //Nếu thành công thì render. Khác với trước đấy là res.render chạy luôn mà không chờ ảnh trả về
      res.render('index.html', {'a': a, 'b': b, 'c': c});
    })
    .catch((err) => {
      res.send(`Error Render Chat: ${err}`);
    });


});

app.listen(4000, () => {
  console.log('Web app promise style listens at port 4000');
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
      [x_series, y_series] = math.gendata(a, b, c);
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

      let filePath = __dirname.concat('/public/1.png');

      let fileStream = fs.createWriteStream(filePath);
      imageStream.pipe(fileStream);
      resolve();
    });

  });
}