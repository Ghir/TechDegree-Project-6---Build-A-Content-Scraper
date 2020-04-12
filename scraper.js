const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const csv = require('fast-csv');
const fields = ['Title', 'Price', 'ImgURL', 'URL', 'Time'];

// search or create data folder
function checkFolder() {
  try {
    fs.statSync('./data');
  } catch (e) {
    fs.mkdirSync('./data');
  }
}

function scrape() {
  checkFolder();
  const dateTime = new Date();
  const date = dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate();
  // send a write stream to the new csv file
  const writeStream = fs.createWriteStream(`./data/${date}.csv`);

  // scrape and crawl function that uses 'x-ray' module
  x('http://www.shirts4mike.com/shirt.php', '.products li', [{
    Title: x("a@href", ".shirt-details h1"),
    Price: x("a@href", ".price"),
    ImgURL: x("a@href", "img@src"),
    URL: "a@href",
  }])
    ((err, obj) => {
      if (err) {
        const errorMessage = `There’s been an error. Cannot connect to ${err.hostname}. (errorCode: ${err.code})`
        console.error(errorMessage);
        fs.appendFileSync('./data/scraper-error.log', `[${dateTime}] ${errorMessage} \r\n`, encoding = 'utf8');
        return
      }
      for (let i = 0; i < 8; i++) {
        obj[i].Time = new Date();
        obj[i].Title = obj[i].Title.slice(4);
      }
      // 'fast-csv' module to convert scraped content to csv
      csv
        .write(obj, {
          headers: fields
        })
        .pipe(writeStream);
      console.log('Content saved.')
    })
}

scrape();
