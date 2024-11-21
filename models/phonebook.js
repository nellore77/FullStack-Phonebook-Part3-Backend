const mongoose = require('mongoose');
// const { type } = require('os');
require('dotenv').config(); // Load env vars

mongoose.set('strictQuery', false);
const url = process.env.MONGODB_URI;

console.error('connecting to', url);

mongoose
  .connect(url)
  .then(() => {
    console.warn('connected to MongoDB');
  })
  .catch((error) => {
    console.error('error connecting to MongoDB:', error.message);
  });

const phoneSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'User phone number required'],
    validate: {
      validator: (v) => {
        // Regular expression to match the required phone number format
        return /^\d{2,3}-\d{5,}$/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Format must be XX-XXXXX or XXX-XXXXX`,
    },
  },
});

phoneSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();

    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Phone', phoneSchema);
