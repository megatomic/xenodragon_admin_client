// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function(app){
//   app.use(
//     createProxyMiddleware('/api', {
//       target: 'http://172.30.1.126:6060',
//       pathRewrite: {
//         '^/api':''
//       },
//       changeOrigin: true
//     })
//   )
  
//   app.use(
//     createProxyMiddleware('/다른context', {
//       target: 'https://다른호스트',
//       pathRewrite: {
//         '^/지우려는패스':''
//       },
//       changeOrigin: true
//     })
//   )
// };