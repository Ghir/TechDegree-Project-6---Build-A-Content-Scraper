var Xray = require('x-ray');
var x = Xray();
var fs = require('fs');
var csv = require('fast-csv');


fs.exists('./data', function(exists) {
  if (!exists) {
    fs.mkdir('./data', function () {
      console.log('folder created!')
    })
  }
});

const dt = new Date();
const date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
var ws = fs.createWriteStream(`./data/ ${date} .csv`);

x('http://www.shirts4mike.com/shirt.php', '.products li', [{
  URL: "a@href",
  ImgURL: x("a@href", "img@src"),
  Price: x("a@href", ".price"),
  Title: x("a@href", ".shirt-details h1"),
}])((err, obj) => {
  for (let i = 0; i < 8; i++) {
    obj[i].Time = new Date();
  }
  csv.write(obj,{headers:true}).pipe(ws);
})
