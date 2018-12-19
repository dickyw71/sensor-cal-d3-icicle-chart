import http from 'http'
import fs from 'fs'

let icicleData = {
    "sensors": {
        "count": 0
    },
    "types": {
        "count": 0
    }
}

async function populateData() {
const sensorsCount = await requestData({
    host: 'localhost',
    port: 3001,
    path: '/api/sensors/?view=count',
    method: 'GET'
  })

sensorsCount
icicleData.sensors.count = sensorsCount[0].total

  icicleData
  const typesCount = await requestData({
    host: 'localhost',
    port: 3001,
    path: '/api/types/?view=count',
    method: 'GET'
  })
  icicleData.types.count = typesCount[0].total 

  let types = await requestData({
    host: 'localhost',
    port: 3001,
    path: '/api/types/',
    method: 'GET'
  })

  types
  icicleData.types.types = types

  icicleData

  Promise.all(icicleData.types.types.map(async (type) => {
      const count =  await requestData({
        host: 'localhost',
        port: 3001,
        path: `/api/types/${type.sensor_type_cd}/sensors/?view=count`,
        method: 'GET'
      })
      let clone = Object.assign({}, type);
      clone.sensor_count = count[0].total
      return clone
  })).then((jsonData) => {

    icicleData.types.types = jsonData;

    // stringify JSON Object
    let jsonContent = JSON.stringify(icicleData); 
    console.log(jsonContent);
    
    fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    
        console.log("JSON file has been saved.");
    }); 
  })  
}

populateData()

function requestData(options) {
    return new Promise((resolve, reject) => {
      http.request(options, function(res) {
          let data = "";
          res.setEncoding('utf8');
          res.on('error', error => reject(error));
          res.on('data', chunk => resolve(JSON.parse(chunk)))
        }).end();
    })
}