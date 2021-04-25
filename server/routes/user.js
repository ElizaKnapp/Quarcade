const express = require("express");
const router = express.Router();
//imports schema from models
const User = require("../models/user");

const socketio = require("../serverSockets.js");

// ------------------------------------ POST Requests ------------------------------------

// Adds a room to the database
router.post("/", function (req, res, next) {
  User.create(req.body)
    .then(function (user) {
      res.send(user); // sends the message back to the client with the added data
    })
    .catch(next);
});

// ------------------------------------ GET Requests ------------------------------------

// retrieves all room information
router.get("/", async (req, res) => {
  User.find()
    .then(function(users) {
      res.send(users)
    })
    .catch(next);
});

//find user by socketId
router.get("/bySocket/:socket", function (req, res, next) {
  var socket = req.params.socket;
  User.find({ socket: socket })
    .then(function (user) {
      
      res.send(user);
    })
    .catch(next);
});

router.get("/byRoom/:roomCode", function (req, res, next) {
  var roomCode = req.params.roomCode;
  User.find({roomCode: roomCode})
    .then(function (users) {
      res.send(users);
    })
    .catch(next);
});

// ------------------------------------ PATCH Requests ------------------------------------

// this function allows you to change the new word votes of an alphasoup room
router.patch("/name/:query", function (req, res, next) {
  // query is the roomCode you want to patch the counter to
  var socket = req.params.query;
  User.findOneAndUpdate({socket: socket}, {name: req.body.name})
    .then(function (user) {
      res.send(user);
    })
    .catch(next);
})

// ------------------------------------ PUT Requests ------------------------------------

// adds a word based on socket id
router.put("/:query", function (req, res, next) {
  var query = req.params.query;
  var word = req.body.wordsOwned.word;
  var points = req.body.wordsOwned.points;

  User.findOneAndUpdate({ socket: query }, { $push: { wordsOwned: {word: word, points: points } } })
    .then(function () {
      User.find({ socket: query }).then(function (user) {
        res.send(user);
      });
    })
    .catch(next);
});

// removes word from specified user
router.put("/removeWord/:username", function (req, res, next) {
  var username = req.params.username;  
  var word = req.body.word;

  User.findOneAndUpdate({ name: username }, 
    { $pull: { wordsOwned: {word: word}}}) //means it will not return mulitple values
    .then(function (user) {
      res.send(user);
    })
    .catch(next);
})

// ------------------------------------ DELETE Requests ------------------------------------

//delete requests BY SOCKET
router.delete("/:socket", function (req, res, next) {
  var socket = req.params.socket;
  User.findOneAndDelete({ socket: socket })
    .then(function (user) {
      res.send(user);
    })
    .catch(next);
});

router.delete("/", function (req, res, next) {
  User.deleteMany({}).then(function() {
    console.log("All elements in collection deleted");
  })
  .catch(next); // weird here, for some reason it works but it never stops
})

module.exports = router;
