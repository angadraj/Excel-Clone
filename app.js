const express = require('express');
const app = express();
const httpServer = require('http').createServer(app);
app.use(express.static('public'));


app.listen(process.env.PORT || 4000, function() {
    console.log("Server is on");
});