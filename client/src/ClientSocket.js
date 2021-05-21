import socketIOClient from "socket.io-client";

// const endpoint = window.location.hostname + ":" + 65080;
const socket = socketIOClient("https://sockets-s53f2ok7la-ue.a.run.app/", {
  withCredentials: true
});

export default socket;