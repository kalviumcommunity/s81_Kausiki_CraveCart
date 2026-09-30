require("dotenv").config();
const express = require('express');
const {app}=require('./app');
require('./db/connection');

const port = process.env.PORT || 1111;
app.listen(port,  () => {
  console.log(`Server running on http://localhost:${port}`)
});
