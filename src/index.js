const express = require('express');

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req, res) => res.send('I am a JavaScript Master!!!'));

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
