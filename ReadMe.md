# Hướng dẫn bài vẽ đồ thị bậc 2

Tác giả Trịnh Minh Cường, bài giảng trong khóa học [Full Stack Node.js 2017](https://techmaster.vn/khoa-hoc/25544/full-stack-nodejs-2017)

### Bài này gồm có 3 bước:
1. Người dùng nhập vào 3 giá trị a, b, c của hàm ```y = f(x) = a.x^2 + b.x + c``` ấn nút submit
2. Tính nghiệm x1 và x2
3. Vẽ đồ thị theo các kỹ thuật khác nhau: không dùng promise, dùng promise, dùng async-await

### Các kỹ thuật demo
- BlueBird Promise, xem [promise.js](https://github.com/TechMaster/vedothibac2/blob/master/promise.js)
- Asyc Await trong ES7, xem [asynawait.js](https://github.com/TechMaster/vedothibac2/blob/master/asynawait.js)
- Viết gulp file để start ứng dụng tự động [gulpfile.js](https://github.com/TechMaster/vedothibac2/blob/master/gulpfile.js)

### Yêu cầu khi làm bài này cần:
1. Sử dụng pattern SOLID, tách phần tính nghiệm, và sinh dữ liệu ra khỏi phần đồ thị để trong tương
lai nếu đổi thư viện vẽ đồ thị, thì chúng ta chỉ phải chỉnh sửa ít nhất

2. Nếu đã tách bách được các module, thành phần thì sẽ kiểm thử sẽ rất dễ dàng


# Các bước thực hiện

### Cài đặt các Node module cần thiết của ví dụ này
```bash
npm init
npm install --save chai express body-parser nunjucks plotly fs
```

### Tạo server express sử dụng template engine Nunjucks đơn giản nhất
```javascript
const express = require('express');
const app = express();
const nunjucks = require('nunjucks');
const bodyParser = require("body-parser");

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
  res.render('index.html');
});

app.listen(8080, () => {
  console.log('Web app listens at port 8080');
});
```
Sau đó chỉnh sửa entry script start ở package.json
```"start": "node nopromise.js"```

## Chạy thử ứng dụng

```bash
git clone https://github.com/TechMaster/vedothibac2.git
cd vedothibac2
npm install
node nopromise.js
node promise.js
node --harmony-async-await asynwait.js
```
Sử dụng browser để truy cập:

- nopromise.js hứng ở cổng 3000, http://localhost:3000
- promise.js hứng ở cổng 4000, http://localhost:4000
- asynawait.js hứng ở cổng 5000, http://localhost:5000. _Chú ý phải có option --harmony-async-await khi dùng node chạy.

### Sử dụng gulp chạy tự động
Thay vì gõ lệnh Node để khởi động 3 web server ta viết code khởi động vào [gulpfile.js](https://github.com/TechMaster/vedothibac2/blob/master/gulpfile.js) sau đó chạy lệnh gulp
Để chạy gulp cần cài thêm các module gulp, gulp-util, child_process
gulp tiết kiệm rất nhiều thời gian gõ lệnh terminal.

### Mẫu dữ liệu [a, b, c] truyền vào:

1. [1, 1, 1]: báo lỗi không vẽ được do đồ thị vô nghiệm
2. [1, 10, 7]: có nghiệm vẽ được đồ thị
3. [-1, 10, 7]: đồ thị úp ngược lại
4. [2, 0, 0]: đáy đồ thị ở gốc [0.0, 0.0]


## Dùng hay không dùng Promise

Có 2 ví dụ: promise.js và nopromise.js

## nopromise.js
```javascript
app.post('/', (req, res) => {
  try {
    [a, b, c] = math.validate_abc(req.body.a, req.body.b, req.body.c);    
    renderChart(a, b, c);
    res.render('index.html', {'a': a, 'b': b, 'c': c});  //trả về ngay mà không chờ kết quả ảnh đã tạo xong chưa
  } catch (err) {
    res.send(`Error: ${err.message}`);
  }
});
```

Ở đây renderChart là hàm asynchronous, nếu res.render không đợi kết quả nó trả về thì server trả về trang web ngay mà 
không quan tâm đồ thị đã được sinh xong hay chưa.

### promise.js
Trong renderChart tạo ra một Promise. Khi nào đồ thị tạo xong thì resolve(), báo hoàn tất. Lúc này mới trả về trang web.
Trang web render sẽ đờ đẫn khi biểu đồ phức tạp, mất nhiều thời gian để vẽ.

Để xử lý vấn đề này, hãy sử dụng kỹ thuật AJAX

```javascript
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
```

## Async Await
Trong Node.js 7.x, async await chỉ là tính năng thử nghiệm phải có option --harmony-async-await khi chạy. Tháng 4/2017, bản Node.js 8.x async-await sẽ được sử dụng 
chính thức.

async await giúp viết code dễ hiểu hơn một chút so với Promise.then. Nếu callback thì hàm xử lý kết quả lồng nhau (nest call back).
Với Promise thì hàm xử lý lại nối chuỗi .then().then().then().
Còn async await viết hàm async nhưng phong cách tuần tự từng dòng lệnh như là viết hàm sync.
