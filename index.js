require("dotenv").config(); // Load env vars
const express = require("express");

const app = express();

const cors = require("cors");

const PhoneBook = require("./models/phonebook");

const PORT = process.env.PORT || 3001;

const morgan = require("morgan");

// app.use(morgan("tiny"));

app.use(express.static("dist"));

app.use(express.json());

app.use(cors()); //allow for requests from all origins

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

// app.use(requestLogger);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
});

// Get details of all persons
app.get("/api/persons", (req, res) => {
  // res.json(persons);
  console.log("/api/persons");

  PhoneBook.find({}).then((persons) => {
    console.log("/api/persons");
    res.json(persons);
  });
});

// Get individual person
app.get("/api/persons/:id", (req, res, next) => {
  console.log("/api/persons/:id");
  const id = req.params.id;
  /*  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).send("Requested person isn't present");
  } */

  PhoneBook.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send("Requested person isn't present");
      }
    })
    /* .catch((error) => {
      console.error("Error: ", error);
      res.status(400).send({ error: "malformatted id" });
    }); */
    .catch((error) => next(error));
});

// Delete person
app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  /*   const findPerson = persons.find((person) => person.id === id);
  if (findPerson) {
    persons = persons.filter((person) => person.id !== id);
    res.status(204).end(); // Use 204 No Content to indicate successful deletion with no response body
  } else {
    res.status(404).send("Requested person isn't present");
  }
   */
  PhoneBook.findByIdAndDelete(id)
    .then((deletedPerson) => {
      if (!deletedPerson) {
        // If no person was found with the given id
        return res.status(404).send("Requested person isn't present");
      }
      // If successful, fetch and return the updated list
      return PhoneBook.find({});
    })
    .then((persons) => {
      if (persons) {
        res.json(persons);
      }
    })
    .catch((error) => next(error));
});

const generateId = () => {
  return Math.floor(Math.random() * 1000000);
};

// Add new person
  app.post("/api/persons", (req, res, next) => {
    console.log("add person");
    if (req.body === undefined) {
      return res.status(400).json({ error: "content missing" });
    }
    const { name, phoneNumber } = req.body;

    if (!name || !phoneNumber) {
      return res.status(400).json({ error: "name or number missing" });
    }

    // Check if a person with the same name already exists
    PhoneBook.findOne({ name })
      .then((existingPerson) => {
        if (existingPerson) {
          // Update the existing person's number if they are found
          return PhoneBook.findByIdAndUpdate(
            existingPerson._id,
            { phoneNumber }, // Update the phone number only
            { new: true, runValidators: true, context: "query" }
          ).then((updatedPerson) => {
            res.status(200).json(updatedPerson); // Return the updated person
          });
        } else {
          // Create a new person if no existing person is found
          const person = new PhoneBook({ name, phoneNumber });
          return person
            .save()
            .then((savedPerson) => {
              res.status(201).json(savedPerson); // Return the saved person
            })
            .catch((error) => next(error));
        }
      })
      .catch((error) => {
        console.error("Post error:  ",error);
        next(error); // Pass any errors to the error handler
      });
  });

// API info
app.get("/info", (req, res) => {
  PhoneBook.find({}).then((persons) => {
    const totalEntries = persons.length;

    console.log("/api/info");
    const time = new Date();
    const sendInfo = `<p>Phonebook has ${totalEntries} entries </p>
      <p> ${time} </p>`;
    res.send(sendInfo);
  });
});

// Unknown endpoint middleware should be placed AFTER all routes
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);
