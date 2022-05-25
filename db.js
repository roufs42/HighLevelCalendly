const firebase = require('firebase');
const firebaseConfig = require('./config.js');

const db = firebase.initializeApp(firebaseConfig);

module.exports = db;

