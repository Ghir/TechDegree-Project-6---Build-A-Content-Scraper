const Xray = require('x-ray');
const x = Xray();
const fs = require('fs');
const csv = require('fast-csv');
const fields = ['Title', 'Price', 'ImgURL', 'URL', 'Time'];

// search for 'data' folder, if doesn't exists then create it
function checkFolder () {
  try {
    fs.statSync('./data');
  } catch(e) {
    fs.mkdirSync('./data');
  }
}

// go to website, scrape content and save it
function scrape () {
  checkFolder();
  // generate new date in format year-month-day
  const dateTime = new Date();
  const date = dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate();
  // send a write stream to the new csv file named after current date
  const writeStream = fs.createWriteStream(`./data/${date}.csv`);

  // scrape and crawl function that uses 'x-ray' module
  x('http://www.shirts4mike.com/shirt.php', '.products li', [{
    Title: x("a@href", ".shirt-details h1"),
    Price: x("a@href", ".price"),
    ImgURL: x("a@href", "img@src"),
    URL: "a@href",
  }])
  // callback
  ((err, obj) => {
    // if error occurs create error message
    if (err) {
      const errorMessage = `There’s been an error. Cannot connect to ${err.hostname}. (errorCode: ${err.code})`
      // show message
      console.error(errorMessage);
      // save error in a new line of 'scraper-error.log'
      fs.appendFileSync('./data/scraper-error.log', `[${dateTime}] ${errorMessage} \r\n`, encoding='utf8');
      return
    }
    // assign 'Time' value and adjust 'Title' value
    for (let i = 0; i < 8; i++) {
      obj[i].Time = new Date();
      obj[i].Title = obj[i].Title.slice(4);
    }
    // use 'fast-csv' module to convert scraped content to csv
    csv
      .write(obj,{
        // with 'fields' array as columns
        headers: fields
      })
      // send stream to csv file
      .pipe(writeStream);
      // show success message
    console.log('Content saved.')
  })
}

scrape();
