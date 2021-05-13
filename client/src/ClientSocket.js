import socketIOClient from "socket.io-client";

// const endpoint = window.location.hostname + ":" + 65080;
const socket = socketIOClient("https://websocket-dot-quarcade.uk.r.appspot.com", {
  withCredentials: true
});

export default socket;