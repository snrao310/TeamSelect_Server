// Required NPM modules: mongodb client, express js, body-parser
// npm install mongodb
// npm install express --save
// npm install body-parser --save

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

app
.get('/', function(req, res) { // Root
  res.send('Hey There');
})
.get('/blog', function(req, res){ // Blog
  res.send('You have reached my blog');
})
.get('/friends', function(req, res) { // Get all Friends
  friend_collection.find().toArray(function(err, items){
    res.send(
      JSON.stringify(
        {"friends":items}
      )
    );
  });
})
.post('/friends', function(req, res){ // Create new friend
  var username = req.body.username;
  var email = req.body.email;
  var latitude = req.body.latitude;
  var json_str = JSON.stringify({"username":username,"email":email,"latitude":latitude});

  console.log("JSON string: \n");
  console.log(json_str);
  res.send('Got the request to create new friend, ' + req.body.username);
})
.listen(3000, function() {
  console.log('Listening on port 3000');
});
