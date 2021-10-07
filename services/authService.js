const uniqid = require('uniqid');
const bcrypt = require('bcrypt');

const users = [
  {
    id: '4z3c5h9ikufy93pp',
    username: 'Ivan@abv.bg',
    password: '$2b$09$Ns.RWuX/zgKhcB3nyzoyHOctzYD.WQXt9dLfxI2ohPRPhCODlkbq6',
  },
];

const register = (username, password) => {
  if (users.some((x) => x.username === username)) {
    throw { message: 'user already registered!' };
  }
  bcrypt.hash(password, 9).then((hash) => {
    const user = { id: uniqid(), username, password: hash };
    users.push(user);
    return user;
  });
};

const login = (username, password) => {
  const user = users.find((x) => x.username === username);
  if (!user) {
    throw { message: 'incorrect user or/and password' };
  }
  return bcrypt.compare(password, user.password);
};

const getUser = (username) => {
  return users.find((x) => x.username === username);
};

const authService = {
  register,
  login,
  getUser,
};

module.exports = authService;
