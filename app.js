require('dotenv').config()

const aws = require('aws-sdk');
const https = require('https');

var creds = new aws.Credentials({
  accessKeyId:      process.env.AWS_AUTH_ACCESSKEYID,
  secretAccessKey:  process.env.AWS_AUTH_SECRETACCESSKEY
});

const route53 = new aws.Route53(options = {credentials: creds});

function getIP(callback) {
  https.get('https://api.ipify.org?format=json', (res) => {
    let data = '';

    // called when a data chunk is received.
    res.on('data', (chunk) => {
        data += chunk;
    });

    // called when the complete response is received.
    res.on('end', () => {
        return callback(null, JSON.parse(data));
    });
  }).on("error", (err) => {
      return callback(err, null);
  });
}

function setIP() {
  getIP(function(err, data) {
    if(!err) {
        var params = {
          ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT", 
              ResourceRecordSet: {
                Name: process.env.AWS_ROUTE53_RECORDNAME, 
                ResourceRecords: [
                  {
                    Value: data.ip
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
        };
        route53.changeResourceRecordSets(params, function(err, data) {
          if (err) {
            console.log(err, err.stack);
          } else {
            console.log(data);
          }
        });
      } else {
        console.log(err);
      }
  });
}

setIP();