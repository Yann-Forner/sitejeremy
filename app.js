var express = require("express");
var mysql = require('mysql');
var mustache = require('mustache-express');
var session = require('express-session');
var formidable = require('formidable');
var fs = require('fs');
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
        res.render('videos',{myResult : myResult, isAdmin :true});//ATTTENTIIOIZOR?RO?OIr
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



app.get('/ajoutVid',(req,res) => {
    if(session.admin === false){//attention
        res.render('ajoutVid',{});
    }else{
        res.redirect("/");
    }

});

app.post('/ajoutVidConfirm',(req,res) => {
    var form = new formidable.IncomingForm();
    var query = "INSERT INTO videos VALUES (null,?,'','',?,'')";



    form.parse(req, function (err, fields, files) {
        sql.query(query,[fields.titre,fields.code], function (err, result) {
            if (err) throw err;
        var oldpath = files.upImg.path;
        var newpath = 'C:/Users/Yann/Desktop/sites/sitejeremy/img/' + "img"+result.insertId+".png";

            sql.query("UPDATE videos SET lienVid = ? , lienSol = ?, lienImg = ? WHERE id = ?",["vid"+result.insertId+".mp4","sol"+result.insertId+".mp4","img"+result.insertId+".png",result.insertId], function (err, result) { if (err) throw err;});


        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.write('File uploaded and moved!');
            res.end();
        });
        });
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