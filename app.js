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

app.use(function (req,res,next) {
    if(session.admin === undefined){
        session.admin = false;
    }
    next();
});


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
        res.render('videos',{myResult : myResult, isAdmin : session.admin});
    });
});
app.get('/detailVid/:id',(req,res) => {
    sql.query('SELECT * FROM videos WHERE id = ? ',[req.params.id] , (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        if(myResult.length === 0) res.render('index',{});

        else{
            myResult[0]['admin'] = session.admin;
            res.render('vidDetail',myResult[0]);
        }
    });

});
app.get('/solution/:id',(req,res)=>{
    res.redirect("/");
});
app.post('/solution/:id',(req,res)=>{
    sql.query('SELECT * FROM videos WHERE id = ? AND codeVid = ?',[req.params.id,req.body.monCode] , (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        if(myResult.length === 0) res.redirect("/detailVid/"+req.params.id);
        else res.render('vidSoluce',myResult[0]);
    });

});



app.get('/ajoutVid',(req,res) => {
    if(session.admin === true){
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
            });

            var oldpath1 = files.upVid.path;
            var newpath1 = 'C:/Users/Yann/Desktop/sites/sitejeremy/videos/' + "vid"+result.insertId+".mp4";
            fs.rename(oldpath1, newpath1, function (err) {
                if (err) throw err;
            });

            var oldpath2 = files.upSoluce.path;
            var newpath2 = 'C:/Users/Yann/Desktop/sites/sitejeremy/videos/' + "sol"+result.insertId+".mp4";
            fs.rename(oldpath2, newpath2, function (err) {
                if (err) throw err;
            });
            res.redirect("/")
        });
    });
});

app.get('/locations',(req,res)=>{
   res.render("locations",{isAdmin : true});
});

app.get('/ajoutLoc',(req,res)=>{
    if(session.admin === true)res.redirect("/");//ATTENTIN
   res.render("ajoutLoc",{})
});

app.get('/co',(req,res) =>{
    if(session.admin){
        res.render('decoAdmin');
    }else{
        res.render('coAdmin',{isFailed : false});
    }
});



app.post('/connectAdmin',(req,res)=>{
    if(req.body.ident === "test" && req.body.pwd === "test"){
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

app.get('/delete/:id',(req,res)=>{
    if(session.admin === false)res.redirect('/');
    sql.query('SELECT * FROM videos WHERE id = ? ',[req.params.id] , (err, result, fields) => {
        if (err) throw err;
        var myResult = result;
        if(myResult.length === 0)res.redirect('/');
        else{
            try{
                fs.unlinkSync("/Users/Yann/Desktop/sites/sitejeremy/img/"+myResult[0].lienImg);
                fs.unlinkSync("/Users/Yann/Desktop/sites/sitejeremy/videos/"+myResult[0].lienVid);
                fs.unlinkSync("/Users/Yann/Desktop/sites/sitejeremy/videos/"+myResult[0].lienSol);

            }catch (err) {
                console.error(err);
            }
            sql.query('DELETE FROM videos WHERE id = '+req.params.id);
            res.redirect('/videos');
        }
    });

});


app.listen(3000, () => console.log('movie server at http://localhost:3000'));