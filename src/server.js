const express = require('express');
const path = require('path');
const chalk = require('chalk')

const app = express();

app.use(express.static(path.join(__dirname, '../build')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(9000, () => {
    console.log(chalk.white("Serving production version of this application on: ") + chalk.blue("http://localhost:9000"))
})


