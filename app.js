var express = require("express");
var mysql = require('mysql');
var mustache = require('mustache-express');
var app = express();


app.use(express.urlencoded());

app.use(express.static('.'));

var sql = mysql.createConnection({
    host: 'mysql-mrcevent.alwaysdata.net',
    user: 'mrcevent',
    password: 'Basededonnee127',
    database: 'mrcevent_siteweb'
});

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');


app.get('/',(req,res) => {
    res.render('index',{});
});

app.get('/videos',(req,res) => {
    sql.query('SELECT * FROM videos ', (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        res.render('videos',{myResult : myResult});
    });
});
app.get('/detailVid/:id',(req,res) => {
    sql.query('SELECT * FROM videos WHERE id = ? ',[req.params.id] , (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        if(myResult.length == 0) res.render('index',{});
        else res.render('vidDetail',myResult[0]);
    });

});

app.post('/solution/:id',(req,res)=>{
    sql.query('SELECT * FROM videos WHERE id = ? AND codeVid = ?',[req.params.id,req.body.monCode] , (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        if(myResult.length == 0) res.redirect("/detailVid/"+req.params.id);
        else res.render('vidSoluce',myResult[0]);
    });

});
app.listen(3000, () => console.log('movie server at http://localhost:3000'));