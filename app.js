

var express = require('express');
var bodyParser = require('body-parser');
var admin = require("firebase-admin");


const app = express();


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
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.get('/', function(req, res) {
  //res.send("Ready to accept from CFM App");
  return res.send('Madden Data');
});

// This accepts all posts requests!
app.post('/*', function(req, res) {
  const db = admin.database();
  const ref = db.ref();
  const dataRef= ref.child("data");
  // Change what is set to the database here
  // Rosters are in the body under rosterInfoList
  const newDataRef = dataRef.push();
  //newDataRef.set({
  //  data: (req && req.body) || ''
  //});


  console.log(req.body.teamStandingInfoList.teamName);
  res.send("Team Rankings: " + req.body.teamStandingInfoList);

});

displayData(data){

}

app.listen(app.get('port'), function() { console.log('Madden Companion Exporter is running on port', app.get('port')) });
