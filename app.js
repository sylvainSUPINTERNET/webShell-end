var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
const exec = require('child_process').exec;
const session = require('express-session');


app.use(session({
    secret: "%dDFy6g#v!ITP3e65oEmneawJ&zuj7iG"
}));

app.set('view engine', 'ejs');


//revoir les redirection href.location avec un event Emitter d'une variable sur le if de data

var destinationNotConnected = '/login';

app.use('/',function(req,res,next){
    io.sockets.on('connection',function(socket){
        socket.on('connected',function(data){
            console.log(data);
            if(data == 'no' || data == null){
                console.log("Vous n'est actuellement pas coonnecter");
                socket.emit("nonConnected","/login");
            }else{
                console.log("Vous etes connecter");
            }
        });
    });
    next();
});


app.get('/',function(req,res){
    res.render('index');
});


io.sockets.on('connection',function(socket){
    socket.on('connected',function(username){
        console.log(username);
        var user = username;
        var allow = false;
        if(user != 'no'){
            console.log("User connected :  " + username);
            allow = true;
        }

        if(user == "no"){
            console.log("No user");
            allow = false;
        }
        socket.emit('allowConnection', allow);

    });

    socket.emit('message', 'Vous êtes bien connecté !');

    socket.on('command',function(data){
        console.log("Ligne de commande enter : " + data);

        exec(data, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            socket.emit('output', `${stdout}`, `${stderr}`); // renvoyer l'erreur aussi et coté client faire  un check error ou non et renvoyer si besoin

        });
    });


    app.get('/login', function (req, res) {
        res.render('login');
    });

});



http.listen(3000, function(){
    console.log('listening on *:3000');
});
