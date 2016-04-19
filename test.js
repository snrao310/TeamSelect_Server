// Required NPM modules: mongodb client, express js, body-parser
// npm install mongodb
// npm install express --save
// npm install body-parser --save

// Firewall Settings:
// sudo ufw enable
// sudo ufw allow 3000

var express     =   require("express"); // express js app
var dbclient    =   require('mongodb').MongoClient; // mongo db client
var bodyParser  =   require('body-parser'); // support json encoded bodies

var database;
var friend_collection;

var app         =   express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Connect to mongo db
dbclient.connect("mongodb://localhost:27017/sgrdatabase_test",
  function(err, db) {
    if (!err) {
      database = db;
      friend_collection = db.collection('friends');
    }
  }
);

// Chained Methods: app.get().get().get().get().post().listen()

app
.get('/', function(req, res) { // Root
  res.send('Hey There');
})
.get('/blog', function(req, res){ // Blog
  res.send('You have reached my blog');
})
.get('/friends', function(req, res) { // Get all Friends
  friend_collection.find().toArray(function(err, items){
    console.log("Got GET request from client: " + req.connection.remoteAddress);
    res.send(
      JSON.stringify(
        {"friends":items}
      )
    );
  });
})
.get('/user/:id', function(req, res) {
  // This code piece was added temporarily to show the
  // team how to search for stuff with REST APIs
  // - Suresh G
  username = req.params.id;
  friend_collection.find({"username":username});
  console.log("Got get request for ID: " + req.params.id);
})
.post('/filter',function(req, res){
  // URL Format: http://<server>:3000/filter
  console.log(req.body.skillset + "\n");
  console.log(req.body.aoi);
})
.get('/skills/:id/aoi/:id2', function(req, res) {
  // URL Format: http://<server>:3000/skills/ruby&python&java&android
  var skills = req.params.id;
  var aoi = req.params.id2;
  var skillset = sills.split("&");
  var aoiset = oai.split("&");
  console.log(arr.toString());
})
.get('/aoi/:id', function(req, res){
  // URL Format: http://<server>:3000/aoi/mobile&software&bigdata


  console.log(arr.toString());
  friend_collection.find({});
})
.post('/register', function(req, res){ // Create new friend
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  var location = req.body.location;
  var mail = req.body.mail;
  var phone = req.body.phone;
  var aoi = req.body.aoi;
  var skillset = req.body.skillset;
  var json_str = JSON.stringify(
    { "username":username,
      "password":password,
      "name":name,
      "location":location,
      "mail":mail,
      "phone":phone,
      "aoi":aoi,
      "skillset":skillset
    }
  );
  friend_collection.insertOne(JSON.parse(json_str));
  console.log("Got POST request from client: " + req.connection.remoteAddress);
  console.log(json_str);
  res.send('Request from ' + req.connection.remoteAddress + ' create new friend, ' + req.body.username);
})
.listen(3000, '0.0.0.0', function() {
  console.log('Listening on port 3000');
});
