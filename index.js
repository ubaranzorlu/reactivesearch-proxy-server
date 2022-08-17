const express = require('express');
const {responseInterceptor, createProxyMiddleware} = require('http-proxy-middleware');
const btoa = require('btoa');
const app = express();
const fixNullValuesOnBuckets = require('./fixNullValuesOnBuckets');

/* This is where we specify options for the http-proxy-middleware
 * We set the target to appbase.io backend here. You can also
 * add your own backend url here */
const options = {
    target: process.env.ELASTIC_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
        proxyReq.setHeader(
            'Authorization',
            `Basic ${btoa(process.env.ELASTIC_CREDENTIALS)}`
        );
    },
    selfHandleResponse: true,
    onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        const response = responseBuffer.toString('utf8'); // convert buffer to string
        try {
          const json = JSON.parse(response);
          if (json) {
            const data = json;
            const fixed = fixNullValuesOnBuckets(data);
            return JSON.stringify(fixed);
          }
        } catch (err) {
          console.log(err);
        }
    
        return response;
      }),
}


/* This is how we can extend this logic to do extra stuff before
 * sending requests to our backend for example doing verification
 * of access tokens or performing some other task */
app.use((req, res, next) => {
    const { body } = req;
    console.log('Verifying requests ✔', body);
    /* After this we call next to tell express to proceed
     * to the next middleware function which happens to be our
     * proxy middleware */
    next();
})

/* Here we proxy all the requests from reactivesearch to our backend */
app.use('*', createProxyMiddleware(options));

app.listen(3000, () => console.log('Server running at http://localhost:3000 🚀'));
