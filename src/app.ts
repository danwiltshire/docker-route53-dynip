import aws from 'aws-sdk';
import https from 'https';
import dotenv from 'dotenv'
import { ChangeResourceRecordSetsRequest } from 'aws-sdk/clients/route53';

/*
* Types
*/
interface IpData {
  ip: string;
}

type GetIpCallback = (err: Error | null, data?: IpData) => void
/*
* End of types
*/

/*
* Function definitions
*/
function getIP(callback: GetIpCallback) {
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
    return callback(err);
  });
}

function setIP(route53_recordname: string, route53_ttl: number, route53_hosted_zone: string) {
  getIP(function (err, data) {
    if (!err && data) {
      const params: ChangeResourceRecordSetsRequest = {
        ChangeBatch: {
          Changes: [
            {
              Action: "UPSERT",
              ResourceRecordSet: {
                Name: route53_recordname,
                ResourceRecords: [
                  {
                    Value: data.ip
                  }
                ],
                TTL: route53_ttl,
                Type: "A"
              }
            }
          ],
          Comment: "Updated via docker-route53-dynip"
        },
        HostedZoneId: route53_hosted_zone
      };
      route53.changeResourceRecordSets(params, function (err, data) {
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
/*
* End of function defs
*/

/*
* Main block
*/
dotenv.config()
const route53 = new aws.Route53();
const {
  AWS_ROUTE53_RECORDNAME,
  AWS_ROUTE53_TTL,
  AWS_ROUTE53_HOSTEDZONEID
} = process.env


if (AWS_ROUTE53_RECORDNAME && AWS_ROUTE53_TTL && AWS_ROUTE53_HOSTEDZONEID) {
  const ttl = Number.parseInt(AWS_ROUTE53_TTL);
  setIP(AWS_ROUTE53_RECORDNAME, ttl, AWS_ROUTE53_HOSTEDZONEID);
} else {
  console.error("One of AWS_ROUTE53_RECORDNAME, AWS_ROUTE53_TTL, AWS_ROUTE53_HOSTEDZONEID was not set");
}
/*
* End of main block
*/
