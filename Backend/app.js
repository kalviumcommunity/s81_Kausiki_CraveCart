const express = require('express');
const app = express();
const {userRouter}=require('./controllers/userRoutes')
const middleware=require('./middleware/error')

app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Server is working!");
});


app.use('/user',userRouter);


app.use(middleware)

module.exports = {app};
