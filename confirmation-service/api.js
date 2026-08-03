const https = require('https');

const options = {
method: 'GET',
    hostname: 'api0.itick.org',
    path: '/stock/kline?region=US&code=NFLX&kType=10&limit=12', // 8=oneday, 9=1week, 10=onemonth
    headers: {
        'accept': 'application/json',
        'token': 'd04be28fbf5d492389f3b254204bf2791a31836555054e84a17035aa9500ecef'
    }
};

const req = https.request(options, function (res) {
    const chunks = [];

    res.on('data', function (chunk) {
        chunks.push(chunk);
    });

    res.on('end', function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());   // c, t --> convert
    });
});

req.end();

