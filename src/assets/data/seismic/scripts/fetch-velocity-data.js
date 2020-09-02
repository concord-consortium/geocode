var Client = require('ftp');
const fs = require('fs');

const host = "data-out.unavco.org";
const dataPath = "/pub/products/velocity/cwu.final_nam14.vel";
const writeFile = "src/assets/data/seismic/cwu.final_nam14.vel";

var client = new Client();
client.on('ready', function() {
  console.log(" connected to data source");
  client.get(dataPath, function(err, fileStream) {
    if (err) throw err;
    const ws = fs.createWriteStream(writeFile);
    console.log(" writing raw data...");
    fileStream.pipe(ws);
    fileStream.on('end',() => console.log(' done writing raw data'));
    fileStream.once('close', () => {
      console.log(" close connection");
      client.end();
      cleanRawData();
    });
  });
});

client.connect({
  host,
  user: "",
  password: "",
});

function cleanRawData() {
  fs.readFile(writeFile, {encoding: 'utf-8'}, function(err, data) {
    if (err) throw error;

    const originalData = data.split('\n'); // convert file data to array
    const foundStations = [];
    const cleanedData = [];

    originalData.forEach(row => {
      if (row.length > 1) {
        // first 7 characters includes station id plus some of the name, and prevents false duplicates
        // in column description rows
        const stationId = row.substr(0, 7);
        if (foundStations.includes(stationId)) return;
        foundStations.push(stationId);
      }
      cleanedData.push(row);
    });

    const cleanedString = cleanedData.join('\n');
    fs.writeFile(writeFile, cleanedString, (err) => {
        if (err) throw err;
        console.log (" Successfully created the cleaned data file", writeFile);
    });
  });
}