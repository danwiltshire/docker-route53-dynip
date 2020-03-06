var AWS = require('aws-sdk');
var _ = require('lodash');

var creds = new AWS.Credentials({
    accessKeyId: '', secretAccessKey: ''
  });


var route53 = new AWS.Route53(options = {credentials: creds});

var params = {
    HostedZoneId: '', /* required */
    RecordName: '', /* required */
    RecordType: 'A', /* required */
  };

var targetRecord = [ '192.0.2.47', '192.0.2.59' ]

function getInternetIP() {
    // from Node.JS docs
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
            console.log(parsedData);
          } catch (e) {
            console.error(e.message);
          }
        });
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
      });


}


getInternetIP()

function update() {
      /* The following example creates a resource record set that routes Internet traffic to a resource with an IP address of 192.0.2.44. */

 var params = {
    ChangeBatch: {
     Changes: [
        {
       Action: "UPSERT", 
       ResourceRecordSet: {
        Name: "", 
        ResourceRecords: [
           {
          Value: targetRecord[0]
         },
         {
             Value: '192.0.2.58'
         }
        ],
        TTL: 300, 
        Type: "A"
       }
      }
     ], 
     Comment: "Updated via docker-route53-dynip"
    }, 
    HostedZoneId: "ZT523OMGT0ZJ7"
   };
   route53.changeResourceRecordSets(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
     /*
     data = {
      ChangeInfo: {
       Comment: "Web server for example.com", 
       Id: "/change/C2682N5HXP0BZ4", 
       Status: "PENDING", 
       SubmittedAt: <Date Representation>
      }
     }
     */
   });
}

route53.testDNSAnswer(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else {
        
        console.log("query successful"); 
        if(_.isEqual(data.RecordData, targetRecord)) {
            console.log("record matches. no changes needed.");
        } else {
            console.log("record data does not match, updating...");
            console.log("record data:")
            console.log(data.RecordData)
            console.log("target:")
            console.log(targetRecord)
            update();
        }
        }
  });