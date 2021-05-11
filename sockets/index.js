const express = require("express");
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);

//for connection string
require("dotenv").config();

//app.use(express.json()); //lets server accept json stuff
app.use(cors()); //some trust able thingy that I don't get

// to look nicer
app.get('/', (req, res) => {res.send('Socket backend is running')})

//connecting sockets
const socket = require("./serverSockets.js");
socket.init(server);

const port = 65080;
io.listen(port);
console.log("listening on port", port);