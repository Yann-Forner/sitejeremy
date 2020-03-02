var express = require("express");
var mustache = require('mustache-express');
var app = express();


app.use(express.urlencoded());

app.use(express.static('.'));

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


app.get('/',(req,res) => {
    res.render('index',{});
});

app.get('/videos',(req,res) => {
   res.render('videos',{});
});


app.listen(3000, () => console.log('movie server at http://localhost:3000'));