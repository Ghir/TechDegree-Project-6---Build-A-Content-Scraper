const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const csv = require('fast-csv');

// search for 'data' folder, if doesn't exists then create it
try {
  fs.statSync('./data');
} catch(e) {
  fs.mkdirSync('./data');
}

// generate new date in format year-month-day
const dt = new Date();
const date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
// send a write stream to the new csv files named after current date
const ws = fs.createWriteStream(`./data/${date}.csv`);

// scraping function that uses 'x-ray' module
x('http://www.shirts4mike.com/shirt.php', '.products li', [{
  Title: x("a@href", ".shirt-details h1"),
  Price: x("a@href", ".price"),
  ImgURL: x("a@href", "img@src"),
  URL: "a@href",
}])((err, obj) => {
  // if error then throw message and save it in 'scraper-error.log'
  if (err) {
    console.log(`There’s been an error. Cannot connect to http://shirts4mike.com. (${err.code})`);
    fs.appendFileSync('./data/scraper-error.log', `[${dt}] ${err.message} \n`, encoding='utf8');
    return
  }
  // assign 'Time' value and adjust 'Title' value
  for (let i = 0; i < 8; i++) {
    obj[i].Time = new Date();
    obj[i].Title = obj[i].Title.slice(4);
  }
  // convert scraped content to csv using 'fast-csv' module and then send stream to csv file
  csv.write(obj,{headers:true}).pipe(ws);
})
