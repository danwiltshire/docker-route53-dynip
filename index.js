require('dotenv').config()

var AWS = require('aws-sdk');



//setIP();


function getIP(callback) {

  const https = require('https');
  https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';

    // called when a data chunk is received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // called when the complete response is received.
    res.on('end', () => {
        //console.log(JSON.parse(data));
        return callback(null, JSON.parse(data));
    });
  }).on("error", (err) => {
      //console.log("Error: ", err.message);
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

//getIP();


/* // from Node.JS docs
function getInternetIP() {
const http = require('https');
http.get('https://api.ipify.org?format=json', (res) => {
const { statusCode } = res;
const contentType = res.headers['content-type'];
let error;
if (statusCode !== 200) {
error = new Error('Request Failed.\n' +
`Status Code: ${statusCode}`);
} else if (!/^application\/json/.test(contentType)) {
error = new Error('Invalid content-type.\n' +
`Expected application/json but received ${contentType}`);
}
if (error) {
console.error(error.message);
// Consume response data to free up memory
res.resume();
return;
}
res.setEncoding('utf8');
let rawData = '';
res.on('data', (chunk) => { rawData += chunk; });
res.on('end', () => {
try {
const parsedData = JSON.parse(rawData);
return parsedData;
} catch (e) {
console.error(e.message);
}
});
}).on('error', (e) => {
console.error(`Got error: ${e.message}`);
});
} */


/* console.log(getInternetIP()).toSt;

var creds = new AWS.Credentials({
  accessKeyId: process.env.AWS_AUTH_ACCESSKEYID, secretAccessKey: process.env.AWS_AUTH_SECRETACCESSKEY
});

var route53 = new AWS.Route53(options = {credentials: creds});

var params = {
  ChangeBatch: {
  Changes: [
    {
      Action: "UPSERT", 
      ResourceRecordSet: {
      Name: process.env.AWS_ROUTE53_RECORDNAME, 
      ResourceRecords: [
        {
          Value: internetIP
        }
      ],
      TTL: process.env.AWS_ROUTE53_TTL, 
      Type: "A"
      }
    }
  ],
    Comment: "Updated via docker-route53-dynip"
  },
  HostedZoneId: process.env.AWS_ROUTE53_HOSTEDZONEID
}; */

/* route53.changeResourceRecordSets(params, function(err, data) {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
  }
}); */