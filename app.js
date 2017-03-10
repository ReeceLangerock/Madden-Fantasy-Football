var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup
// Change the default port here if you want for local dev.
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));

mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ds161485.mlab.com:61485/revo-gm`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection eror:'));
db.once('open', function() {
    console.log("connected");
})


var leagueInfoData = [];
var tempTeamStandingInfoDump = [];


app.get('/', function(req, res) {
    res.send("waiting for data");
});

app.get('/test', function(req, res) {

    res.render('index', {
        title: 'My App',
        items: leagueInfoData
    });

});


// This accepts all posts requests!
app.post('/*', function(req, res) {

    var leagueID = req.params[0].split("/")[1];

    if (leagueID != "5414177") {
        console.log("Nice try, asshole.");
        res.send("Nice try, asshole.");
    }

    var collection = req.params[0].split("/");
    var label = "data";
    if (collection.length == 3) {
        collection = collection[2];
    } else if (collection.includes("week")) {
        collection = collection.slice(2, 5);
        collection = collection.join('');
        label = Object.keys(req.body)[0]

    } else if (collection.includes("team") && collection.length > 4) {
        collection = collection.slice(3, 4);
        label = "roster"
        collection = collection.join('');

    } else {
        collection = collection.slice(2, 5);
        collection = collection.join('');
    }

    var data = req.body;
    remove(label).then(function(response, error) {
        if (response == 'REMOVED') {
            db.collection(collection).insert({
                label: label,
                data: data
            });
            res.end();
        }
    })

});

function remove(label) {
    return new Promise(function(resolve, reject) {
            db.collection(collection).remove({
                label: label
            }, function(err, doc) {
                if (err) {
                    reject(err);
                } else {
                    resolve("REMOVED")
                }
            });
        })

    }


    function calculatePyth(data) {
        console.log(data.teamName);
        var teamName = data.teamName;
        var gamesPlayed = data.totalWins + data.totalLosses + data.totalTies;
        var wins = data.totalWins;
        var pointsFor = data.ptsFor * gamesPlayed;
        var pointsAgainst = data.ptsAgainst * gamesPlayed;

        var expectedWins = (Math.pow(pointsFor, 2.37) / (Math.pow(pointsFor, 2.37) + Math.pow(pointsAgainst, 2.37)) * gamesPlayed);
        var pythDiff = (wins - expectedWins);
        pythDiff = pythDiff.toFixed(2);
        expectedWins = Math.round(expectedWins * 100) / 100;

        leagueInfoData.push({
            "teamName": teamName,
            "gamesPlayed": gamesPlayed,
            "teamWins": wins,
            "pointsScored": pointsFor,
            "pointsAllowed": pointsAgainst,
            "pythExpWins": expectedWins,
            "pythDiff": pythDiff
        });

    }


    app.listen(app.get('port'), function() {
        console.log('Madden Companion Exporter is running on port', app.get('port'))
    });
