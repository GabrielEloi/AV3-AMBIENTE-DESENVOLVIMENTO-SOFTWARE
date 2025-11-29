const express = require('express');
const path = require('path');

const app = express();

const porta = 3000;

app.use(express.static(path.join(__dirname, 'public')));

function RotaPrincipal(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  return 'Pagina inicial enviada';
}

app.get('/', RotaPrincipal);

app.listen(porta, () => {
  let msg = 'Server';
  msg = `${msg} `;
  msg = `${msg}running`;
  msg = `${msg} `;
  msg = `${msg}on`;
  msg = `${msg} `;
  msg = `${msg}port`;
  msg = `${msg} `;
  msg += porta;
  return msg;
});
