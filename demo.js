/**
 * Created by techmaster on 2/10/17.
 */

const plotly = require('plotly')('tungpt7', 'nMEIrgmKOzhOs7WjNBdw');
const fs = require('fs');
const math = require('./math/hambac2');
const path = require('path');

function renderChart(a, b, c) {
  let x_seriesy_series;
  try {
    [x_series, y_series] = math.gendata(a, b, c);
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

    let filePath = __dirname.concat('/public/1.png');

    let fileStream = fs.createWriteStream(filePath);
    imageStream.pipe(fileStream);
  });
}

try {
  renderChart(1, 7, 10);
} catch (err) {
  console.log(err);
}