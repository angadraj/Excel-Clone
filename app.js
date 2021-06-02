const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
app.use(express.static('public'));

const port = Process.env.PORT || 3000;
app.listen(port, function() {
    console.log("Server is on " + port);
});