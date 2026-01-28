const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const {userRouter}=require('./controllers/userRoutes')
const { kitchenRouter } = require('./controllers/kitchenRoutes')
const { orderRouter } = require('./controllers/orderRoutes')
const { subscriptionRouter } = require('./controllers/subscriptionRoutes')
const { favoriteRouter } = require('./controllers/favoriteRoutes')
const { adminRouter } = require('./controllers/adminRoutes')
const middleware=require('./middleware/error')
require('./config/passport')

const isAllowedDevOrigin = (origin) => {
  if (!origin) return true; // non-browser or same-origin

  // Allow Vite dev servers on localhost/127.0.0.1 (ports can vary)
  return (
    /^http:\/\/localhost:\d+$/.test(origin) ||
    /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
  );
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedDevOrigin(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded verification documents/media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/test", (req, res) => {
  res.send("Server is working!");
});


app.use('/user',userRouter);

app.use('/api/kitchens', kitchenRouter);
app.use('/api/orders', orderRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/admin', adminRouter);


app.use(middleware)

module.exports = {app};
