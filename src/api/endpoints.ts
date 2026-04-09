import express from 'express';
import { Dictionary } from '../persistance/dictionary.js';
const app = express();

// Middleware for parsing JSON
app.use(express.json());

let users = await Dictionary.Define({});

// GET - Retrieve all users
app.get('/word', (req, res) => {
  res.json(users);
});
app.listen(7777, ()=>console.log("Listening"));