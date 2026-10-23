const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regd_users = express.Router();
const users = [];
const isValid = username => users.some(user => user.username === username);
const authenticatedUser = (username, password) => users.some(user => user.username === username && user.password === password);
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid login credentials' });
  const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  return res.json({ message: 'User successfully logged in' });
});
regd_users.put('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const review = req.query.review ?? req.body.review;
  if (!review) return res.status(400).json({ message: 'Review is required' });
  book.reviews[req.user.username] = review;
  return res.json({ message: 'Review added/updated successfully', reviews: book.reviews });
});
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (!Object.hasOwn(book.reviews, req.user.username)) return res.status(404).json({ message: 'Review not found' });
  delete book.reviews[req.user.username];
  return res.json({ message: 'Review deleted successfully', reviews: book.reviews });
});
module.exports = { authenticated: regd_users, isValid, authenticatedUser, users };
