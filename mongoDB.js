require('dotenv').config(); // Load env vars
const mongoose = require('mongoose');

// Ensure the password is provided
if (process.argv.length < 3) {
  console.error('Password is missing.');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://arjun:${password}@cluster0.sup7h.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);

/* const name = process.argv[3];
const phoneNumber = process.argv[4]; */

mongoose.set('strictQuery', false);

mongoose.connect(url);

const phoneSchema = new mongoose.Schema({
  name: String,
  phoneNumber: Number,
});

const Phone = mongoose.model('Phone', phoneSchema);
console.error('process.argv ', process.argv);
// If only the password is provided, display all entries
if (process.argv.length === 3) {
  Phone.find({}).then((result) => {
    console.error('Phonebook:');
    result.forEach((phone) => {
      console.error(`${phone.name} ${phone.phoneNumber}`);
    });
    mongoose.connection.close();
  });

  // If both name and phone number are provided, add the entry
} else if (process.argv.length === 5) {
  const name = process.argv[3];
  const phoneNumber = process.argv[4];

  const phone = new Phone({
    name: name,
    phoneNumber: phoneNumber,
  });

  phone.save().then(() => {
    console.error(`Added ${name} number ${phoneNumber} to phonebook`);
    mongoose.connection.close();
  });
} else {
  console.error(
    'Please provide both a name and a phone number or just a password to view entries.'
  );
  process.exit(1);
}
