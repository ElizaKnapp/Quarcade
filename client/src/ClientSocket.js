import socketIOClient from "socket.io-client";

// const endpoint = window.location.hostname + ":" + 65080;
const socket = socketIOClient("https://socket-dot-quarcade.uk.r.appspot.com/socket.io/?EIO=4&transport=polling&t=Nbz0VfM", {
  withCredentials: true,

    transportOptions: {
      polling: {
        extraHeaders: {
          "my-custom-header": "abcd"
        }
      }
    }
});

export default socket;