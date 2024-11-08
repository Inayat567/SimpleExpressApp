const express = require("express");
const connectToWhatsApp = require("./src/sendMessage.js");
const App = express();
const PORT = process.env.PORT || 3000;

App.get("/", (req, res) => {
  res.send("Home Page").status(200);
});

App.get("/sendWhatAppMessage", async (req, res) => {
  try {
    const data = req.query;
    const groupId = data.groupId;
    const message = { text: data.message };
    console.log(message);

    let response = await connectToWhatsApp(groupId, message);

    // Handle the response based on your logic
    if (response === "Success") {
      return res.status(200).send('success').end();
    } else if (response === "Failed") {
      return res.status(500).send("Failed!").end();
    } else {
      return res.status(500).send("Unknown").end();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error").end();
  }
});

App.get("/about", (req, res) => {
  res.send("About Page").status(200);
});

App.get("/contact", (req, res) => {
  res.send("Contact Page").status(200);
});

App.listen(PORT, () => {
  console.log(`Listening on Port : ${PORT}`);
});
