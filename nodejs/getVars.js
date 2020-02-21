/*
 * NodeJS Pixelblaze Websocket Example - getVars
 *
 * This will request exported variables from Pixelblaze. To get interesting data, at least one variable
 * must be exported, e.g.:
 * export var myVar = 0
 *
 * You can use this to peek at pattern variables, and any sensor expansion board variables used
 * will come through as well.
 *
 * This is a one-shot example, typically you would leave the websocket connected and send messages when you need
 * something rather than opening and closing the websocket every time.
 */

const WebSocket = require('ws');

//this will receive both text/JSON and binary frames from Pixelblaze
function handleMessage(message) {
  if (typeof message === "string") {
    try {
      let data = JSON.parse(message);
      //if we get vars, go head and close the websocket and quit
      if (data.vars) {
        console.log("Received vars", data.vars);
        ws.close();
        process.exit(0);
      }
    } catch (err) {
      console.error("Problem parsing packet", err);
    }
  } else {
    //this is in case it is a binary frame. message should be an ArrayBuffer.
  }
}

//this is called when the websocket connects
function handleOpen() {
  //once the websocket is open, we can send the getVars command
  const frame = JSON.stringify({
    getVars: true
  });
  ws.send(frame);
}

function handleError(err) {
  console.log("websocket error:", err);
}


//Now set up a WebSocket and connect.
var myArgs = process.argv.slice(2);
//see if a host was passed on the command line, otherwise assume its the AP mode ip address
const host = myArgs.length > 0 ? myArgs[0] : "192.168.4.1";
let ws = new WebSocket('ws://' + host + ":81");
ws.binaryType = "arraybuffer";
ws.on('open', handleOpen);
ws.on('close', function () {console.log("websocket closed!")});
ws.on('message', handleMessage);
ws.on('pong', function () {});
//NOTE: you must register error listener otherwise it crashes node :(
ws.on('error', function (err) {console.error("websocket error: ", err)});

//set a timer to give up after 10 seconds
setTimeout(function() {
  console.error("Timed out waiting for connection and/or getVars result");
  process.exit(-1);
}, 10000)
