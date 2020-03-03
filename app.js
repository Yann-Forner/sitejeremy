var express = require("express");
var mysql = require('mysql');
var mustache = require('mustache-express');
var session = require('express-session');
var app = express();


app.use(express.urlencoded());
app.use(session({
    secret: 'My super session secret',
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 10
    }

})
);

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
    if(session.admin === undefined){
        session.admin = false;
    }
    console.log("admin : "+session.admin)
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
app.get('/solution/:id',(req,res)=>{
    res.redirect("/");
});
app.post('/solution/:id',(req,res)=>{
    sql.query('SELECT * FROM videos WHERE id = ? AND codeVid = ?',[req.params.id,req.body.monCode] , (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        if(myResult.length == 0) res.redirect("/detailVid/"+req.params.id);
        else res.render('vidSoluce',myResult[0]);
    });

});

app.get('/co',(req,res) =>{
    if(session.admin){
        res.render('decoAdmin');
    }else{
        res.render('coAdmin',{isFailed : false});
    }
});



app.post('/connectAdmin',(req,res)=>{
    if(req.body.ident === "test" && req.body.ident === "test"){
        session.admin=true;
        res.redirect("/");
    }else{
        res.render("coAdmin",{isFailed : true});
    }
});

app.get('/disconnectAdmin',(req,res)=>{
   session.admin=false;
   res.redirect("/");
});
app.listen(3000, () => console.log('movie server at http://localhost:3000'));