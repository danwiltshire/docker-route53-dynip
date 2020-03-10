require('dotenv').config()

var AWS = require('aws-sdk');
const https = require('https');

function getIP(callback) {
  https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';

    // called when a data chunk is received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // called when the complete response is received.
    res.on('end', () => {
        console.log("getIP complete response...");
        return callback(null, JSON.parse(data));
    });
  }).on("error", (err) => {
      console.log("getIP hit error...");
      return callback(err, null);
  });
}

function setIP() {
  getIP(function(err, data) {
    if(!err) {
        console.log(data);
      } else {
        console.log(err);
      }
  });
}

setIP();