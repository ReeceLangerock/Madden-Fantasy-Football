var express = require('express');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");
var path = require('path');



const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// TODO: Enter the path to your service account json file
// Need help with this step go here: https://firebase.google.com/docs/admin/setup
const serviceAccount = require("./madden-fantasy-football-firebase-adminsdk-muktr-2fa7ca5b53.json");

// TODO: Enter your database url from firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://madden-fantasy-football.firebaseio.com"
});

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


var leagueInfoData = [];
var tempTeamStandingInfoDump = [];


app.get('/', function(req, res) {
    res.send("waiting for data");
});

app.get('/test', function(req, res) {
  console.log(leagueInfoData);
    res.render('index', {
        title: 'My App',
        items: leagueInfoData
    });

});


// This accepts all posts requests!
app.post('/*', function(req, res) {

    //const db = admin.database();
    //const ref = db.ref();
    //const dataRef = ref.child("data");
    // Change what is set to the database here
    // Rosters are in the body under rosterInfoList
    //const newDataRef = dataRef.push();
    //newDataRef.set({
    //  data: (req && req.body) || ''
    //});
    if ('rosterInfoList' in req.body) {
        for (let i = 0; i < req.body.rosterInfoList.length; i++) {
            console.log(req.body.rosterInfoList[i].firstName + " " + req.body.rosterInfoList[i].lastName);
        }
    } else if ('teamStandingInfoList' in req.body) {
        for (let i = 0; i < 32; i++) {
            tempTeamStandingInfoDump.push(req.body.teamStandingInfoList[i]);
        }
    }

    for (let i = 0; i < tempTeamStandingInfoDump.length; i++) {
        calculatePyth(tempTeamStandingInfoDump);
    }
    leagueInfoData.sort((a, b) => a.pythExpWins > b.pythExpWins ? -1 : 1);
    tempTeamStandingInfoDump = [];

    res.end();
});

function calculatePyth(data) {

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
