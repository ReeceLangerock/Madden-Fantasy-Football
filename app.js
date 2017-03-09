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
db.once('open', function(){
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
    var collection = req.params[0].split("/");
    var documentName;
    if (collection.length == 3){
      collection = collection[2];
    } else{
      collection = collection.slice(2,5);
      collection = collection.join('');
      documentName = collection[6];

    }
    console.log(collection);
    //collection = String(collection);
    var data = req.body;
    db.collection(collection).remove({});
    db.collection(collection).insert({documentName: data});
    //db.collection('everything').insert({test : data});

    /*
    const db = admin.database();
    const ref = db.ref();
    const dataRef = ref.child("data");
    // Change what is set to the database here
    // Rosters are in the body under rosterInfoList
    const newDataRef = dataRef.push();
    newDataRef.set({
      data: (req && req.body) || ''
    });
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
    */
    res.end();
});

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
