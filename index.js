const express = require("express");

const app = express();

const cors = require("cors");

const PORT = process.env.PORT || 3001;

const morgan = require("morgan");

// app.use(morgan("tiny"));

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
  res.json(persons);
});

// Get individual person
app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).send("Requested person isn't present");
  }
});

// Delete person
app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const findPerson = persons.find((person) => person.id === id);

  if (findPerson) {
    persons = persons.filter((person) => person.id !== id);
    res.status(204).end(); // Use 204 No Content to indicate successful deletion with no response body
  } else {
    res.status(404).send("Requested person isn't present");
  }
});

const generateId = () => {
  return Math.floor(Math.random() * 1000000);
};

// Add new person
app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Content missing",
    });
  }

  const namePresent = persons.some((person) => person.name === body.name);
  if (namePresent) {
    return res.status(400).json({
      error: "Name must be unique",
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  
  res.json(persons);
});

// API info
app.get("/info", (req, res) => {
  const totalEntries = persons.length;
  const time = new Date();
  const sendInfo = `<p>Phonebook has ${totalEntries} entries </p>
    <p> ${time} </p>`;
  res.send(sendInfo);
});

// Unknown endpoint middleware should be placed AFTER all routes
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);
