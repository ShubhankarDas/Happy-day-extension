const functions = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');
const express = require('express');
const engines = require('consolidate');
const bodyParser = require('body-parser');
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

async function addQuoteMiddleware(req, res, next) {
  let { quote, image_name } = req.body;
  if (!quote || quote.length < 1) {
    return res.status(400).send({
      status: 400,
      message: 'Quote missing',
    });
  }
  let images = await getImageList();
  if (!image_name || image_name.length < 1 || !images.includes(image_name)) {
    return res.status(400).send({
      status: 400,
      message: 'Image_name missing',
    });
  }
  return next();
}

async function addQuote({ quote, image_name }) {
  const res = await db.collection('quotes').add({
    quote,
    image_name,
  });
  return 'Quote added';
}

async function getAllQuotes() {
  quotesList = await getQuptes();
  return quotesList;
}

async function getImageList() {
  let quotes = await getAllQuotes();
  let images = quotes.map((q) => q.image_name);
  return [...new Set(images)];
}

const app = express();
app.engine('hbs', engines.handlebars);
app.set('views', './views');
app.set('view engine', 'hbs');

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));
app.use(bodyParser.json());

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

app.get('/quote', async (req, res) => {
  quote = await getRandomQuote();
  if (quote) {
    return res.status(200).send({
      status: 200,
      res: quote,
    });
  } else {
    return res.status(200).send({
      status: 404,
    });
  }
});

app.get('/admin', async (req, res) => {
  let images = await getImageList();
  return res.render('admin', {
    images: images,
  });
});

app.get('/quotes', async (req, res) => {
  quotes = await getAllQuotes();
  if (quotes) {
    return res.status(200).send({
      status: 200,
      res: quotes,
    });
  } else {
    return res.status(200).send({
      status: 404,
    });
  }
});

app.post('/quote', addQuoteMiddleware, async (req, res) => {
  result = await addQuote(req.body);
  return res.status(200).send({
    status: 200,
    res: result,
  });
});

app.use((req, res, next) => {
  res.redirect('/');
});

exports.app = functions.https.onRequest(app);
