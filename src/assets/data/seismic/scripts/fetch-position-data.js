var Client = require('ftp');
const fs = require('fs');

const host = "data-out.unavco.org";
const dataPathById = id => `/pub/products/position/${id}/${id}.cwu.nam14.csv`;
const writeFileById = id => `src/assets/data/seismic/position.${id}.cwu.nam14.csv`;

const stationIds = [
  "HARV",
  "P513",
  "FGST",
  "P519",
  "P518",
  "P521",
  "P535",
  "P537",
  "CRGG",
  "P522",
  "P541",
  "P543",
  "BVPP",
  "P544",
  "P563",
  "P558",
  "P565",
  "P567",
  "P570",
  "P571",
  "P573",
  "P093",
  "P094",
  "P092",
  "CRAM",
];

stationIds.forEach(writeFTPStreamToFile);

function writeFTPStreamToFile(stationId) {
  var client = new Client();

  client.on('ready', function() {
    console.log(` connected to data source for ${stationId}`);
    const dataPath = dataPathById(stationId);
    const writeFile = writeFileById(stationId);

    client.get(dataPath, function(err, fileStream) {
      if (err) {
        console.log(` Errored on ${dataPath}`);
        throw err;
      }
      const ws = fs.createWriteStream(writeFile);
      console.log(` writing raw data for ${dataPath}...`);
      fileStream.pipe(ws);
      fileStream.on('end',() => console.log(` done writing ${writeFile}`));
      fileStream.once('close', () => {
        client.end();
        cleanRawData(writeFile);
      });
    });
  });

  client.connect({
    host,
    user: "",
    password: "",
  });
}

/**
 * Remove all data except Date, North (mm), East (mm).
 * Also remove white-space around columns
 */
function cleanRawData(writeFile) {
  fs.readFile(writeFile, {encoding: 'utf-8'}, function(err, data) {
    if (err) throw error;

    const originalData = data.split('\n'); // convert file data to array
    const cleanedData = [];

    originalData.forEach(row => {
      const cols = row.split(",");
      if (cols.length > 7) {
        cleanedData.push(cols.slice(0, 3).map(val => val.trim()).join(","));
      } else {
        cleanedData.push(row);
      }
    });

    const cleanedString = cleanedData.join('\n');
    fs.writeFile(writeFile, cleanedString, (err) => {
        if (err) throw err;
        console.log (" Successfully created the cleaned data file", writeFile);
    });
  });
}