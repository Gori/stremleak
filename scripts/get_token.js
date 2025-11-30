const readline = require('readline');
const https = require('https');
const querystring = require('querystring');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('--- Reddit Refresh Token Generator ---');
console.log('1. Go to https://www.reddit.com/prefs/apps');
console.log('2. Create a new app (select "web app")');
console.log('3. Set redirect uri to: http://localhost:8080');
console.log('-------------------------------------');

rl.question('Enter Client ID: ', (clientId) => {
    rl.question('Enter Client Secret: ', (clientSecret) => {

        const redirectUri = 'http://localhost:8080';
        const scope = 'read';
        const state = 'random_string';

        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&duration=permanent&scope=${scope}`;

        console.log('\n-------------------------------------');
        console.log('Visit this URL in your browser:');
        console.log(authUrl);
        console.log('-------------------------------------');
        console.log('After authorizing, you will be redirected to a URL like: http://localhost:8080/?state=...&code=...');

        rl.question('\nPaste the "code" parameter value from the URL here: ', (rawCode) => {

            // Clean the code (remove trailing #_ if present, which happens in some browsers)
            const code = rawCode.trim().split('#')[0];

            // Exchange code for refresh token
            const postData = querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            });

            const options = {
                hostname: 'www.reddit.com',
                path: '/api/v1/access_token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': postData.length,
                    'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
                    'User-Agent': 'stremleak-token-generator/1.0'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        if (json.error) {
                            console.error('\nError:', json.error);
                            console.error('Full response:', json);
                        } else {
                            console.log('\n-------------------------------------');
                            console.log('SUCCESS! Here is your Refresh Token:');
                            console.log(json.refresh_token);
                            console.log('-------------------------------------');
                            console.log('Add this to your .env file as REDDIT_REFRESH_TOKEN');
                        }
                    } catch (e) {
                        console.error('Error parsing response:', e);
                        console.log('Raw response:', data);
                    }
                    rl.close();
                });
            });

            req.on('error', (e) => {
                console.error('Request error:', e);
                rl.close();
            });

            req.write(postData);
            req.end();
        });
    });
});
