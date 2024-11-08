const { makeWASocket } = require("@whiskeysockets/baileys");
const {
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");

const connectToWhatsApp = (id, message) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(
        "auth_info_baileys"
      );
      const sock = makeWASocket({
        version: [2, 2323, 4],
        printQRInTerminal: true,
        auth: state,
      });

      sock.ev.on("creds.update", saveCreds);
      sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
          let reason = await new Boom(lastDisconnect?.error)?.output
            ?.statusCode;
          if (reason === DisconnectReason.badSession) {
            console.error(`Bad Session, Please Delete /auth and Scan Again`);
            reject("Failed");
          } else if (reason === DisconnectReason.connectionClosed) {
            console.warn("Connection closed, reconnecting....");
            resolve(await connectToWhatsApp(id, message));
          } else if (reason === DisconnectReason.connectionLost) {
            console.warn("Connection Lost from Server, reconnecting...");
            resolve(await connectToWhatsApp(id, message));
          } else if (reason === DisconnectReason.connectionReplaced) {
            console.error(
              "Connection Replaced, Another New Session Opened, Please Close Current Session First"
            );
            reject("Failed");
          } else if (reason === DisconnectReason.loggedOut) {
            console.error(
              `Device Logged Out, Please Delete /auth and Scan Again.`
            );
            reject("Failed");
          } else if (reason === DisconnectReason.restartRequired) {
            console.info("Restart Required, Restarting...");
            resolve(await connectToWhatsApp(id, message));
          } else if (reason === DisconnectReason.timedOut) {
            console.warn("Connection TimedOut, Reconnecting...");
            resolve(await connectToWhatsApp(id, message));
          } else {
            console.warn(`Unknown DisconnectReason: ${reason}: ${connection}`);
            resolve(await connectToWhatsApp(id, message));
          }
        } else if (connection === "open") {
          console.info("Opened connection");
          sock.sendMessage(id, message);
          resolve("Success");
        }
      });

      sock.ev.on("messages.upsert", async (m) => {
        console.log(m);
      });
    } catch (e) {
      console.log(e);
      resolve(await connectToWhatsApp(id, message)); //trying to connect if there any error occured
    }
  });
};
//http://localhost:3000/sendWhatAppMessage?groupId=923435339100@s.whatsapp.net&message=text message
// connectToWhatsApp("923435339100@s.whatsapp.net", {text: "message"});
module.exports = connectToWhatsApp;
