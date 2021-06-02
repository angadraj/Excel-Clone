const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
app.use(express.static('public'));

let port = process.env.PORT || 3000;
httpServer.listen(port,function(){
    console.log("server is listening to request at port " + port);
})