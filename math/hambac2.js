/**
 * Created by techmaster on 2/10/17.
 */
function validate_abc(a, b, c) {
   if (isNaN(a)){
        throw new Error('a is not number');
    }

    if (isNaN(b)){
        throw new Error('b is not number');
    }

    if (isNaN(c)){
        throw new Error('c is not number');
    }

   if (parseFloat(a) === 0) {
        throw new Error('a equal to zero');
   }
   return [parseFloat(a), parseFloat(b), parseFloat(c)];
}

exports.validate_abc = validate_abc;
/***
 * Calculate x1, x2 that satisify equation y(x1) === y(x2) === 0
 * @param a_
 * @param b_
 * @param c_
 * @returns {[*,*]}
 */
function findX (a_, b_, c_){
    let [a, b, c] = validate_abc(a_, b_, c_);

    let delta = (b * b) - (4 * a * c);

    if (delta < 0) {
        throw new Error('delta less than zero');
    }

    let sqrtDelta = Math.sqrt(delta);
    let twoa =  2 * a;
    return [(-b - sqrtDelta) / twoa, (-b + sqrtDelta) / twoa];

}

exports.findX = findX;
/***
 * calculate y = f(x) = a.x^2 + b.x + c
 * @param a
 * @param b
 * @param c
 * @param x
 * @returns {Number}
 */
function findY (a,b,c,x) {
  return (a * x * x) + (b * x) + c;
}

exports.findY = findY;

/***
 * Generate two arrays xseries, yseries
 * @param a
 * @param b
 * @param c
 */
exports.gendata = (a,b,c) => {

  let [x1, x2] = findX(a, b, c);
  if (x1 > x2) {
    let temp = x1;
    x1 = x2;
    x2 = temp;
  }
  console.log('x1 = ', x1, ', x2 = ', x2);
  let margin = 5.0;
  let step = 0.1;
  let [X1, X2] = [x1 - margin, x2 + margin];

  let xseries = [];
  let yseries = [];
  let x = X1;
  while (x < X2) {
    xseries.push(x);
    yseries.push(findY(a, b, c, x));
    x += step;
  }

  return [xseries, yseries,x1,x2];
};