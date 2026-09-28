const passport = require('passport');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { UserModel } = require("../model/userModel");

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:1111/user/google/callback';

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error('No email found in Google profile'));
          }

          const email = profile.emails[0].value;
          const name = profile.displayName;
          let user = await UserModel.findOne({ email });

          if (!user) {
            user = new UserModel({
              name,
              email,
              password: '',
              role: 'customer',
              isActivated: true,
            });
            await user.save();
          }

          return done(null, { profile, user });
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.log('Google OAuth credentials not configured in environment.');
}

module.exports = passport;