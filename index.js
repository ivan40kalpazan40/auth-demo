const path = require('path');
const express = require('express');
const handlebars = require('express-handlebars');
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const auth = require('./middlewares/authMiddleware');

const authService = require('./services/authService');
const { SECRET } = require('./constants');
const app = express();

// template view engine
app.set('views', path.resolve('./views'));
app.engine('hbs', handlebars({ extname: '.hbs' }));
app.set('view engine', 'hbs');

// cookie parser setup
app.use(cookieParser());

// static files setup
app.use(express.static(path.resolve('./public')));

// body parser setup
app.use(express.urlencoded({ extended: false }));

app.get('/', async (req, res) => {
  const token = req.cookies.user;
  if (token) {
    await jwt.verify(token, SECRET, (err, decodedToken) => {
      if (err) {
        console.error(err.message);
        return res.render('index');
      }
      return res.render('index', { token: decodedToken });
    });
  } else {
    return res.render('index');
  }
});

// REGISTER
app.get('/user/register', (req, res) => {
  res.render('user/register');
});

app.post('/user/register', async (req, res) => {
  //TODO...
  const { username, password, password2 } = req.body;

  if (password !== password2) {
    const error = new Error('Passwords should match!');
    console.error(`ERR::: ${error.message}`);
    return res.status(400).send(error.message);
  }
  try {
    await authService.register(username, password);
    res.redirect('/user/login');
  } catch (error) {
    console.error(`ERR::: ${error.message}`);
    return res.status(400).send(error.message);
  }
});

// LOGIN
app.get('/user/login', (req, res) => {
  res.render('user/login');
});

app.post('/user/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const isValid = await authService.login(username, password);
    if (isValid) {
      const user = await authService.getUser(username);
      jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) {
            console.error(`ERR::: ${err.message}`);
            return res.status(400).send(err.message);
          }
          res.cookie('user', token);
          res.redirect('/');
        }
      );
    } else {
      res.status(401).send('Cannot login');
    }
  } catch (error) {
    res.status(401).send(error.message);
  }
});

// PROFILE
app.get('/user', auth, (req, res) => {
  if (!req.user) {
    return res.status(401).send('You are not authorized to see this page!');
  }
  res.render('user/profile', req.user);
});
app.listen(4000, console.log.bind(console, 'Server running on port 4000....'));
