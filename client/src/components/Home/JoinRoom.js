import React, { Component } from "react";
import Axios from "axios";
import clientSocket from "../../ClientSocket.js";
import { BrowserRouter as Router, Switch, Route, Link, Redirect } from "react-router-dom";

class JoinRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: "",
      redirectToLobby: false,
    };
  }
  


  // ------------------------------------ Axios Requests ------------------------------------

  // joins room if it exists
  async joinRoom(roomCode) {
    try {

      // checks if room exists
      await Axios.get(`http://localhost:5000/homeLobby/${roomCode}`).then(
        res => {
          const matches = res.data;

          // joins the room if it exists
          if (matches.length > 0) {

            // adds user to the room in the database
            Axios.put(`http://localhost:5000/homeLobby/${roomCode}`, { users: {socket: clientSocket.id } });

            // add user to the user collection
            Axios.post("http://localhost:5000/user", {roomCode: roomCode, name: clientSocket.id, socket: clientSocket.id});

            // adds user to socket room
            clientSocket.emit("moveRoom", roomCode);

            // handles update of the players in the room
            clientSocket.emit("reqUsersInRoom");
            clientSocket.emit("reqSocketRoom");

            // redirects user to lobby
            this.setState({
              redirectToLobby : true
            });

          } else {
            alert("This room does not exist");
          }
        },
        error => {
          console.log(error);
        }
      );
    } catch (error) {
      console.log("There was an error with Axios getRoom");
    }
  }



  // ------------------------------------ Form & Button Handling ------------------------------------

  // handles changes to text field for room code
  handleChangeJoinRoom = event => {
    this.setState({
      roomCode: event.target.value
    });
  };

  // submits room code to database
  handleSubmitJoinRoom = event => {
    event.preventDefault();

    // need to connect with backend database and implement verification
    this.joinRoom(this.state.roomCode);

    //clears the fields, this is just to make it look better
    this.setState({ roomCode: "" });
  };



  // ------------------------------------ Render ------------------------------------
  
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmitJoinRoom}>
          <label>
            Enter a room code to join a room:
            <input name="roomCode" type="text" value={this.state.roomCode} onChange={this.handleChangeJoinRoom} />
          </label>
        </form>
        {this.state.redirectToLobby ? (<Redirect to="/lobby" />) : null}
      </div>
    );
  }
}

export default JoinRoom;
