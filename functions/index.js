const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const cors = require('cors');
firebaseAdmin.initializeApp();
const db = firebaseAdmin.firestore();

let quotesList = [];

async function getQuptes() {
  const data = [];
  const snapshot = await db.collection('quotes').get();
  snapshot.forEach((doc) => {
    data.push(doc.data());
  });

  return data;
}

async function getRandomQuote() {
  if (quotesList.length === 0) quotesList = await getQuptes();
  const random = Math.floor(Math.random() * quotesList.length);
  return quotesList[random];
}

async function addQuote({ quote, image_name }) {
  const res = await db.collection('quotes').add({
    quote,
    image_name,
  });
  return res;
}

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

app.get('/', async (req, res) => {
  quote = await getRandomQuote();
  if (quote) {
    return res.render('home', {
      image_name: quote.image_name,
      message: quote.message,
    });
  } else {
    return res.render('home', {
      image: '',
      message: 'Something went wrong',
    });
  }
});

app.post('/quote', async (req, res) => {
  res = await addQuote(req.params);
  return res.status(200).send({
    status: 200,
    res: req.params,
  });
});

app.use((req, res, next) => {
  res.redirect('/');
});

exports.app = functions.https.onRequest(app);
