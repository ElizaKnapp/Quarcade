import React, { Component } from 'react';
import Axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";
import StartGameAlphaSoup from './StartGameAlphaSoup.js';

import clientSocket from "../../ClientSocket.js";

// right now ready button is not being used at all
import ReadyButton from './ReadyButton.js';

class ChooseGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      votesAlphaSoup: 0,
      votesCodeNames: 0,
      gameVoted: "", // this is the game that the player currently has their vote for
      roomCode: "", // should get the roomcode at the beginning to request
      readyAlphaSoup: false, // whether all players have votes for the same thing yet
      readyCodeNames: false,
      startAlphaSoup: false // whether alphasoup should start or not
    }
  }

  // ------------------------------------ Socket.io ------------------------------------
  
  componentDidMount() {


    // when the component mounts, get the roomCode
    clientSocket.once("reqSocketRoom");
    // receive the room and change the state
    clientSocket.on("recSocketRoom", (room) => {
      this.setState({
        roomCode: room
      })
      // DONE: When component mounts, get current votes in Alpha and Code
      // PULL VOTES
      this.pullRoomVotes();
    })

    clientSocket.on("recAddVoteAlphaSoup", () => {
      const newVoteNum = this.state.votesAlphaSoup + 1;
      this.setState({
        votesAlphaSoup: newVoteNum,
      });
      // TODO: PUSH TO DATABASE
      this.updateAlphaSoupVotes(1);

      // check if you are ready to start
      // compare the votes in alphasoup to the people in the room
      this.compareVoteCounts(this.state.votesAlphaSoup, "AlphaSoup");
    });

    clientSocket.on("recAddVoteCodeNames", () => {
      const newVoteNum = this.state.votesCodeNames + 1;
      this.setState({
        votesCodeNames: newVoteNum,
      });
      // TODO: PUSH TO DATABASE

      // check if you are ready to start
      // compare users in the roomCode to the votes in the state
      this.compareVoteCounts(this.state.votesCodeNames, "CodeNames");
    });

    clientSocket.on("recRemoveVoteAlphaSoup", () => {
      const newVoteNum = this.state.votesAlphaSoup - 1;
      this.setState({
        votesAlphaSoup: newVoteNum,
      });
      // TODO: REMOVE FROM DATABASE
    });

    clientSocket.on("recRemoveVoteCodeNames", () => {
      const newVoteNum = this.state.votesCodeNames - 1;
      this.setState({
        votesCodeNames: newVoteNum,
      });
      // TODO: REMOVE FROM DATABASE
    });

    // to get prepared to start (unanimous vote on a game)
    clientSocket.on("recStart", (game) => {
      // console.log("received request to start");

      //TOD0: make it wait a bit before changing rooms
      if (game === "AlphaSoup") {
        this.setState({readyAlphaSoup: true})
      }
      if (game === "CodeNames") {
        this.setState({readyCodeNames: true})
      }
    })

    // to start the alphaSoupGame
    clientSocket.on("recStartAlphaSoup", () => {
      this.setState({startAlphaSoup: true});
      // TODO: UPON THE STARTING OF ANY GAME, WIPE ALL THE VOTES
    })

  }

  componentWillUnmount() {
    clientSocket.off("recAddVoteAlphaSoup");
    clientSocket.off("recAddVotesCodeNames");
    clientSocket.off("recRemoveVotesAlphaSoup");
    clientSocket.off("recRemoveVotesCodeNames");
    clientSocket.off("recStart");
  }

  
  // ------------------------------------ Form & Button Handling ------------------------------------

  handleVoteAlphaSoup = (event) => {
    event.preventDefault();

    // if you didn't already vote for alpha, increase votes
    if (this.state.gameVoted === "AlphaSoup") {
      // remove a vote
      clientSocket.emit("reqRemoveVoteAlphaSoup");
      // switch state back to no game voted
      this.setState({gameVoted: ""});
    } else {
      // check if you are switching from CodeNames
      if (this.state.gameVoted === "CodeNames") {
        // remove a vote from CodeNames first
        clientSocket.emit("reqRemoveVoteCodeNames");
      }
      clientSocket.emit("reqAddVoteAlphaSoup");
      this.setState({gameVoted: "AlphaSoup"});

    }
  }

  handleVoteCodeNames = (event) => {
    event.preventDefault();
    // if you didn't already vote for codenames incrase votes
    if (this.state.gameVoted === "CodeNames") {
      clientSocket.emit("reqRemoveVoteCodeNames");
      // switch state back to no game voted
      this.setState({gameVoted: ""});
    } else {
      // check if you are switching from AlphaSoup
      if (this.state.gameVoted === "AlphaSoup") {
        // remove a vote from CodeNames first
        clientSocket.emit("reqRemoveVoteAlphaSoup");
      }
      clientSocket.emit("reqAddVoteCodeNames");
      this.setState({gameVoted: "CodeNames"});
    }
  }

  async compareVoteCounts(votes, game) {
    try {
      await Axios.get(`http://localhost:5000/user/byRoom/${this.state.roomCode}`).then(
        res => {
          const playerCount = res.data.length;
          // console.log(playerCount);
          // console.log(votes);
          if (playerCount === votes) {
            // ask to start game
            // console.log("emitted because " + votes + "=" + playerCount)
            // console.log("game");
            clientSocket.emit("reqStart", game);
          }
           
        }
      )
    } catch (error) {
      console.log("could not get users by room");
    }
  }

  async pullRoomVotes() {
    try {
      await Axios.get(`http://localhost:5000/${this.state.roomCode}`).then(
        res => {
          const roomGot = res.data[0];
          const newAlphaSoupVotes = roomGot.votesAlphaSoup;
          const newCodeNamesVotes = roomGot.votesCodeNames;
          // new votes counts
          this.setState({
            votesAlphaSoup: newAlphaSoupVotes,
            votesCodeNames: newCodeNamesVotes
          })

        }
      )
      // get info
    } catch (error) {
      console.log("could not get the current state of votes");
    }
  }

  async updateAlphaSoupVotes(change) {
    const newValue = this.state.votesAlphaSoup + change;
    try {
      await Axios.patch(`http://localhost:5000/changeVotesAlphaSoup/${this.state.roomCode}`, {votesAlphaSoup: newValue});
    } catch (error) {
      console.log("could not patch the values AlphaSoup");
    }
  }

  async updateCodeNamesVotes(change) {
    const newValue = this.state.votesCodeNames + change;
    try {
      await Axios.patch(`http://localhost:5000/changeVotesCodeNames/${this.state.roomCode}`, {votesCodeNames: newValue});
    } catch (error) {
      console.log("could not patch the values CodeNames");
    }
  }



  // ------------------------------------ Render ------------------------------------

  // need to connect game selection with backend database
  render() {
    return (
      <div>
        <h1>Games! (click one to vote)</h1>
        <h2 onClick={this.handleVoteAlphaSoup}>AlphaSoup (votes: {this.state.votesAlphaSoup})</h2>
        {this.state.readyAlphaSoup ? <StartGameAlphaSoup/>: null}
        <h2 onClick={this.handleVoteCodeNames}>CodeNames (votes: {this.state.votesCodeNames})</h2>
        {/*this.state.readyCodeNames ? (start codename component here) : null */}
      </div>
    );
  }
}

export default ChooseGame;
