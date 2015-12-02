var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var crypto = require('crypto');
var cookie = require('cookie');
var ejs = require('ejs');

var jquery = fs.readFileSync('./js/jquery-1.11.2.min.js', 'utf8');
var threejs = fs.readFileSync('./js/three.min.js', 'utf8');
var orbit = fs.readFileSync('./js/OrbitControls.js', 'utf8');
var fonthelvetiker = fs.readFileSync('./js/helvetiker_regular.typeface.js', 'utf8');
var bootstrap_css = fs.readFileSync('./css/bootstrap.min.css', 'utf8');
var bootstrap_js = fs.readFileSync('./js/bootstrap.min.js', 'utf8');
var dashboard_css = fs.readFileSync('./css/dashboard.css', 'utf8');
var threedboard_css = fs.readFileSync('./css/threedboard.css', 'utf8');
var glyphicons_woff_two = fs.readFileSync('./fonts/glyphicons-halflings-regular.woff2');
var glyphicons_woff = fs.readFileSync('./fonts/glyphicons-halflings-regular.woff');
var glyphicons_ttf = fs.readFileSync('./fonts/glyphicons-halflings-regular.ttf');

var favicon = fs.readFileSync('./favicon.ico');
var indexpage = fs.readFileSync('./index.html', 'utf8');
var registpage = fs.readFileSync('./regist.html', 'utf8');
var loginpage = fs.readFileSync('./login.html', 'utf8');
var dashboardpage_e = fs.readFileSync('./dashboard.ejs', 'utf8');
var superuserpage = fs.readFileSync('./superuser.html', 'utf8');
var threedboardpage_e = fs.readFileSync('./threedboard.ejs', 'utf8');
var challengespage_e = fs.readFileSync('./challenges.ejs', 'utf8');
var scoreboardpage_e = fs.readFileSync('./scoreboard.ejs', 'utf8');

var welcome = fs.readFileSync('./imgs/welcome.png');
var caption = fs.readFileSync('./imgs/caption.png');
var signup = fs.readFileSync('./imgs/signup.png');
var login = fs.readFileSync('./imgs/login.png');
var rules = fs.readFileSync('./imgs/rules.png');
var nexturl = fs.readFileSync('./imgs/nexturl.png');
var teamlist_g = fs.readFileSync('./imgs/teamlist.png');
var visualizer = fs.readFileSync('./imgs/visualizer.png');
var challenges = fs.readFileSync('./imgs/challenges.png');
var scoreboard_g = fs.readFileSync('./imgs/scoreboard.png');

var wolf = fs.readFileSync('./qfiles/flag.doc');
var x86 = fs.readFileSync('./qfiles/x86.png');
var atari = fs.readFileSync('./wav/ataridayo.wav');

var urlappear_flag = 0;
var urldata = ["", "", ""];

var HOST = "localhost";
var PORT = "1337";

var server = http.createServer(doRequest);
server.listen(Number(PORT));

var MongoClient = require("mongodb").MongoClient;
var io = require('socket.io').listen(server);

console.log("http server running...\n");

function doRequest(req, res){
    var remoteIP = req.connection.remoteAddress;

    var path = url.parse(req.url);
    console.log("IP:" + remoteIP + " - " + req.method + " " + path.pathname);

    switch(path.pathname){
        case '/':
            res.setHeader('Content-Type', 'text/html');
            res.write(indexpage);
            res.end();
            break;

        case '/regist':
            if(req.method === "POST"){

                var reqBody = '';
                req.on('data', function(data){
                    reqBody += data;
                });
                req.on('end', function() {
                    var form = qs.parse(reqBody);
                    var userid_q = form.userid;
                    var passwd_q = form.passwd;
                    var teamid_q = form.teamid;
                    var email_q = form.email;

                    var sha1 = crypto.createHash('sha1');
                    sha1.update(passwd_q);
                    var passhash = sha1.digest('hex');

                    var sha1sid = crypto.createHash('sha1');
                    sha1sid.update(userid_q + passwd_q);
                    var sidhash = sha1sid.digest('hex');

                    if(userid_q == "" || passwd_q == "" || teamid_q == "" || email_q == ""){
                        res.setHeader('Content-Type', 'text/html');
                        res.write('<meta charset="UTF-8">クエリエラー');
                        res.end();
                    }
                    else{
                        MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
                            if(err){return console.dir(err);}

                            db.collection("members", function(err, collection){
                                collection.find({userID: userid_q}).toArray(function(err, items){
                                    if(0 < items.length){
                                        res.setHeader('Content-Type', 'text/html');
                                        res.write('<meta charset="UTF-8">UserIDが既に登録されています');
                                        res.end();
                                    }
                                    else{
                                        collection.find({teamID: teamid_q}).toArray(function(err, items_t){
                                            if(items_t.length >= 4){
                                                res.setHeader('Content-Type', 'text/html');
                                                res.write('<meta charset="UTF-8">既に4人のユーザが登録されています');
                                                res.end();
                                            }
                                            else{
                                                var userdoc = [{userID: userid_q, teamID: teamid_q, password: passhash, email: email_q, sid: sidhash, point: 0}];
                                                collection.insert(userdoc, function(err, result){
                                                    if(err){return console.dir(err);}

                                                    res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                                                    res.end();
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
            }
            else{
                res.setHeader('Content-Type', 'text/html');
                res.write(registpage);
                res.end();
            }

            break;

        case '/login':
            if(req.method === "POST"){
                var reqBody = '';
                req.on('data', function(data){
                    reqBody += data;
                });
                req.on('end', function(){
                    var form = qs.parse(reqBody);
                    var userid_q = form.userid;
                    var passwd_q = form.passwd;

                    var sha1 = crypto.createHash('sha1');
                    sha1.update(passwd_q);
                    var passhash = sha1.digest('hex');

                    if(userid_q == "" || passwd_q == ""){
                        res.setHeader('Content-Type', 'text/html');
                        res.write('<meta charset="UTF-8">クエリエラー');
                        res.end();
                    }
                    else{
                        MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
                            if(err){return console.dir(err);}

                            db.collection("members", function(err, collection) {
                                collection.find({userID: userid_q, password: passhash}).toArray(function(err, items) {
                                    if(0 < items.length){

                                        var ck1 = cookie.serialize('SESSION_ID', items[0].sid, {maxAge: 14400});
                                        res.setHeader('Set-Cookie', ck1);
                                        res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/dashboard"});
                                        res.end();
                                    }
                                    else{
                                        res.setHeader('Content-Type', 'text/html');
                                        res.write("<p>NOT EXIST!!!</p>")
                                        res.end();
                                    }
                                });
                            });
                        });
                    }
                });
            }
            else{
                res.setHeader('Content-Type', 'text/html');
                res.write(loginpage);
                res.end();
            }

            break;

        case '/dashboard':
            if(req.headers.cookie != null){
                var ck = cookie.parse(req.headers.cookie);

                MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
                    if(err){return console.dir(err);}

                    db.collection("members", function(err, collection){
                        collection.find({sid: ck.SESSION_ID}).toArray(function(err, items){
                            if(0 < items.length){
                                var yourdata = [items[0].userID, items[0].point, items[0].teamID]

                                collection.distinct("teamID", function(err, teamlist){

                                    collection.find({}, {_id: false, userID: true, teamID: true}).toArray(function(err, users){

                                        if(urlappear_flag == 0){
                                            var dashboardpage = ejs.render(dashboardpage_e, {
                                                ejsteamlist: teamlist,
                                                ejsusersdata: users,
                                                ejsyourdata: yourdata,
                                                ejsurl1: "coming soon...",
                                                ejsurl2: "coming soon...",
                                                ejsurl3: "coming soon..."
                                            });
                                        }
                                        else{
                                            var dashboardpage = ejs.render(dashboardpage_e, {
                                                ejsteamlist: teamlist,
                                                ejsusersdata: users,
                                                ejsyourdata: yourdata,
                                                ejsurl1: urldata[0],
                                                ejsurl2: urldata[1],
                                                ejsurl3: urldata[2]
                                            });
                                        }

                                        res.setHeader('Content-Type', 'text/html');
                                        res.write(dashboardpage);
                                        res.end();
                                    });
                                });
                            }
                            else{
                                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                                res.end();
                            }
                        });
                    });
                });
            }
            else{
                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                res.end();
            }

            break;

        case '/threedboard':
            if(req.headers.cookie != null){
                var ck = cookie.parse(req.headers.cookie);

                MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
                    if(err){return console.dir(err);}

                    db.collection("members", function(err, collection){
                        collection.find({sid: ck.SESSION_ID}).toArray(function(err, items){
                            if(0 < items.length){
                                var yourdata = [items[0].userID, items[0].point, items[0].teamID];

                                collection.distinct("teamID", function(err, teamid_list){
                                    collection.find({}, {_id: false, userID: true, teamID: true, point: true}).toArray(function(err, users){
                                        db.collection("correct_ans_log", function(err, collectionanslog){
                                            collectionanslog.find({}, {_id: false, flag: false}, {sort: {timestamp: 1}}).toArray(function(err, items_ans_log){

                                                var threedboardpage = ejs.render(threedboardpage_e, {
                                                    ejsteamlist: teamid_list,
                                                    ejsusersdata: users,
                                                    ejsyourdata: yourdata,
                                                    ejsanslog: items_ans_log
                                                });

                                                res.setHeader('Content-Type', 'text/html');
                                                res.write(threedboardpage);
                                                res.end();
                                            });
                                        });
                                    });
                                });
                            }
                            else {
                                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                                res.end();
                            }
                        });
                    });
                });
            }
            else {
                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                res.end();
            }

            break;

        case '/challenges':
            if(req.headers.cookie != null){
                var ck = cookie.parse(req.headers.cookie);

                MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
                    if(err){return console.dir(err);}

                    db.collection("members", function(err, collection){
                        collection.find({sid: ck.SESSION_ID}).toArray(function(err, items){
                            if(0 < items.length){
                                var yourdata = [items[0].userID, items[0].point, items[0].teamID];

                                collection.distinct("teamID", function(err, teamid_list){
                                    collection.find({}, {_id: false, userID: true, teamID: true, point: true}).toArray(function(err, users){
                                        db.collection("correct_ans_log", function(err, collectionanslog){
                                            collectionanslog.find({}, {_id: false, flag: false}, {sort: {timestamp: 1}}).toArray(function(err, items_ans_log){

                                                var challengespage = ejs.render(challengespage_e, {
                                                    ejsteamlist: teamid_list,
                                                    ejsusersdata: users,
                                                    ejsyourdata: yourdata,
                                                    ejsanslog: items_ans_log
                                                });

                                                res.setHeader('Content-Type', 'text/html');
                                                res.write(challengespage);
                                                res.end();
                                            });
                                        });
                                    });
                                });
                            }
                            else {
                                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                                res.end();
                            }
                        });
                    });
                });
            }
            else {
                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                res.end();
            }

            break;

        case '/scoreboard':
            if(req.headers.cookie != null){
                var ck = cookie.parse(req.headers.cookie);

                MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
                    if(err){return console.dir(err);}

                    db.collection("members", function(err, collection){
                        collection.find({sid: ck.SESSION_ID}).toArray(function(err, items){
                            if(0 < items.length){
                                var yourdata = [items[0].userID, items[0].point, items[0].teamID];

                                collection.distinct("teamID", function(err, teamid_list){
                                    collection.find({}, {_id: false, userID: true, teamID: true, point: true}).toArray(function(err, users){
                                        db.collection("correct_ans_log", function(err, collectionanslog){
                                            collectionanslog.find({}, {_id: false, flag: false}, {sort: {timestamp: 1}}).toArray(function(err, items_ans_log){

                                                var scoreboardpage = ejs.render(scoreboardpage_e, {
                                                    ejsteamlist: teamid_list,
                                                    ejsusersdata: users,
                                                    ejsyourdata: yourdata,
                                                    ejsanslog: items_ans_log
                                                });

                                                res.setHeader('Content-Type', 'text/html');
                                                res.write(scoreboardpage);
                                                res.end();
                                            });
                                        });
                                    });
                                });
                            }
                            else {
                                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                                res.end();
                            }
                        });
                    });
                });
            }
            else {
                res.writeHead(302, {Location: "http://" + HOST + ":" + PORT + "/login"});
                res.end();
            }

            break;

        case '/logout':
            var ck1 = cookie.serialize('SESSION_ID', "", {maxAge: -1});
            res.setHeader('Set-Cookie', ck1);
            res.writeHead(302, {Location: "http://" + HOST + ":" + PORT});
            res.end();
            break;

        case '/favicon.ico':
            res.setHeader('Content-Type', 'image/x-icon');
            res.write(favicon);
            res.end();
            break;


        case '/js/jquery-1.11.2.min.js':
            res.setHeader('Content-Type', 'text/javascript');
            res.write(jquery);
            res.end();
            break;

        case '/js/three.min.js':
            res.setHeader('Content-Type', 'text/javascript');
            res.write(threejs);
            res.end();
            break;

        case '/js/orbitControls.js':
            res.setHeader('Content-Type', 'text/javascript');
            res.write(orbit);
            res.end();
            break;

        case '/js/helvetiker_regular.typeface.js':
            res.setHeader('Content-Type', 'text/javascript');
            res.write(fonthelvetiker);
            res.end();
            break;

        case '/css/bootstrap.min.css':
            res.setHeader('Content-Type', 'text/css');
            res.write(bootstrap_css);
            res.end();
            break;

        case '/js/bootstrap.min.js':
            res.setHeader('Content-Type', 'text/javascript');
            res.write(bootstrap_js);
            res.end();
            break;

        case '/css/dashboard.css':
            res.setHeader('Content-Type', 'text/css');
            res.write(dashboard_css);
            res.end();
            break;

        case '/css/threedboard.css':
            res.setHeader('Content-Type', 'text/css');
            res.write(threedboard_css);
            res.end();
            break;

        case '/fonts/glyphicons-halflings-regular.woff2':
            res.setHeader('Content-Type', 'application/font-woff');
            res.write(glyphicons_woff_two);
            res.end();
            break;

        case '/fonts/glyphicons-halflings-regular.woff':
            res.setHeader('Content-Type', 'application/font-woff');
            res.write(glyphicons_woff);
            res.end();
            break;

        case '/fonts/glyphicons-halflings-regular.ttf':
            res.setHeader('Content-Type', 'application/x-font-ttf');
            res.write(glyphicons_ttf);
            res.end();
            break;


        case '/imgs/welcome.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(welcome);
            res.end();
            break;

        case '/imgs/caption.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(caption);
            res.end();
            break;

        case '/imgs/signup.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(signup);
            res.end();
            break;

        case '/imgs/login.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(login);
            res.end();
            break;

        case '/imgs/rules.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(rules);
            res.end();
            break;

        case '/imgs/nexturl.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(nexturl);
            res.end();
            break;

        case '/imgs/teamlist.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(teamlist_g);
            res.end();
            break;

        case '/imgs/visualizer.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(visualizer);
            res.end();
            break;

        case '/imgs/challenges.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(challenges);
            res.end();
            break;

        case '/imgs/scoreboard.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(scoreboard_g);
            res.end();
            break;


        // --------------------------------------------------------------------------------------
        // Question files
        // --------------------------------------------------------------------------------------
        case '/qfiles/flag.doc':
            res.setHeader('Content-Type', 'application/msword');
            res.write(wolf);
            res.end();
            break;

        case '/qfiles/x86.png':
            res.setHeader('Content-Type', 'image/png');
            res.write(x86);
            res.end();
            break;

        // --------------------------------------------------------------------------------------
        // SE
        // --------------------------------------------------------------------------------------
        case '/wav/ataridayo.wav':
            res.setHeader('Content-Type', 'audio/x-wav');
            res.write(atari);
            res.end();
            break;


        // --------------------------------------------------------------------------------------
        // Super users page
        // --------------------------------------------------------------------------------------
        case '/a441b8954dc8343b1ff34628322a05edf3e0a381':
            res.setHeader('Content-Type', 'text/html');
            res.write(superuserpage);
            res.end();
            break;


        default:
            res.setHeader('Content-Type', 'text/html');
            res.write('404 not found.');
            res.end();
            break;
    }
}

// --------------------------------------------------------------------------------------
// Socket.IO
// --------------------------------------------------------------------------------------

io.sockets.on('connection', function(socket){

    // --------------------------------------------------------------------------------------
    // Dash board page
    // --------------------------------------------------------------------------------------
    socket.on("url_threedboard", function(data){
        data[0] += HOST + ":" + PORT + "/threedboard\">http://" + HOST + ":" + PORT + "/threedboard</a>";
        data[1] += HOST + ":" + PORT + "/challenges\">http://" + HOST + ":" + PORT + "/challenges</a>";
        data[2] += HOST + ":" + PORT + "/scoreboard\">http://" + HOST + ":" + PORT + "/scoreboard</a>";
        io.sockets.emit("url_threedboard_appear", data);

        urlappear_flag = 1;
        urldata[0] = data[0];
        urldata[1] = data[1];
        urldata[2] = data[2];
    });

    // --------------------------------------------------------------------------------------
    // Threed board page
    // --------------------------------------------------------------------------------------
    socket.on("flagdata", function(data) {
        console.log(data);
        data = data.split(":");
        console.log(data);
        io.sockets.emit("packetanimation", [data[0], data[2], 0]);
        var sha1flagdata = crypto.createHash('sha1');
        sha1flagdata.update(data[3]);
        var flagdata = sha1flagdata.digest('hex');
        console.log(flagdata);

        MongoClient.connect("mongodb://localhost/t2cctfdb", function(err, db){
            if(err){return console.dir(err);}

            db.collection("all_logs", function(err, coll){
                coll.insert([{teamID: data[1], userID: data[0], qID: data[2], rdata: data[3]}], function(err, result){
                    if(err){return console.dir(err);}
                });
            });

            db.collection("flags", function(err, collection){
                collection.find({flag: flagdata, qID: data[2]}).toArray(function(err, items){
                    console.log("Check the flag : " + items.length);

                    if(0 < items.length){
                        db.collection("correct_ans_log", function(err, collectionlog){
                            collectionlog.find({teamID: data[1], qID: data[2]}).toArray(function(err, items2){
                                console.log(items2);
                                if(0 < items2.length){
                                    console.log("userID:" + data[0] + " is confirming the " + data[2] + " flag now.");
                                }
                                else {
                                    io.sockets.emit("ataridayo", ["userID : " + data[0] + ", " + "teamID : " + data[1] + ", " + "qID : " + data[2] + ", " + "Flag : " + data[3]]);
                                    console.log("kokodayoooo");
                                    var objDate = new Date();
                                    var time = objDate.getTime();
                                    var docs2 = [{teamID: data[1], userID: data[0], qID: data[2], flag: data[3], timestamp: time}];

                                    collectionlog.insert(docs2, function(err, result) {
                                        console.log("items :");
                                        console.log(items);
                                        io.sockets.emit("gliphiconIn", [data[2], data[0], data[1]]);

                                        db.collection("members", function(err, collectionloglog) {
                                            collectionloglog.update({userID: data[0]}, {$inc: {point: items[0].point}});
                                            io.sockets.emit("pointModify", [data[0], data[1], data[2], items[0].point]);
                                            console.log("complete!");
                                        });
                                    });
                                }
                            });
                        });

                        var resulttext = "Congratulations! " + data[3] + " is the flag!";
                        var resultlist = [resulttext, 1, data[2]];
                        socket.emit("flagresulttext", resultlist);
                    }
                    else{
                        console.log("nanimonaiyo");
                        var resulttext = "Oops... " + data[3] + " is wrong.";
                        var resultlist = [resulttext, 0, data[2]];
                        socket.emit("flagresulttext", resultlist);
                    }
                    setTimeout(function() {
                        io.sockets.emit("packetanimation", [data[2], data[0], 1]);
                    }, 1200);
                });
            });
        });
    });
});




