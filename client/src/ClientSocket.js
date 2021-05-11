import socketIOClient from "socket.io-client";

const endpoint = window.location.hostname + ":" + 65080;
const socket = socketIOClient(endpoint);

export default socket;