const express = require('express');
const {app}=require('./app')
const connection =require('./db/connection')

require("dotenv").config()

app.get("/test", async (req, res) => {
  res.send("Server is working!");
});

const port = process.env.PORT;
app.listen(port,  () => {
  console.log(`Server running on http://localhost:${port}`)
  connection

});
