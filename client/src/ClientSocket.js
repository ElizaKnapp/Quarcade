import socketIOClient from "socket.io-client";

const endpoint = "https://api-dot-quarcade.uk.r.appspot.com/";
const socket = socketIOClient(endpoint);

export default socket;