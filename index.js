import http from 'http';
import fs from 'fs';

function readJsonFile() {
  return new Promise((resolve, reject) => {
    let obj = {}
    fs.readFile('./sensor-cal-data.json', 'utf8', function (err, data) {
      if (err) reject(err);
      obj = JSON.parse(data);
      resolve(obj)
    }) 
  })
}

function writeJsonFile() {

}

var options = {
  host: 'localhost',
  port: 3001,
  path: '/api/sensors/?view=count',
  method: 'GET'
};

const elementArr = [
  'sensors',
  'parts',
  'types',
  'calibrations'
];

const optionsArr = elementArr.map((ele) => {
  return {
    datapath: `${ele}`,
    options: {
      host: 'localhost',
      port: 3001,
      path: `/api/${ele}/?view=count`,
      method: 'GET'
    }
  };
})
optionsArr

const reducer = async (accumulator, currentValue) => {
  let count = await requestData(currentValue.options)
  count
  let obj = accumulator[currentValue.datapath] = count
  return obj
}

readJsonFile().then((jsonData, err) => {
  if (err) throw err
  return jsonData 
}).then(data => { 
  let json = optionsArr.reduce(reducer, {})
  json
})

function requestData(options) {
  return new Promise((resolve, reject) => {
    http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('error', error => reject(error));
        res.on('data', chunk => resolve(JSON.parse(chunk)[0].total));
      }).end();
  })
}
