// Required steps:
// npm install mongodb
// npm install express --save

var express     =   require("express");
var app         =   express();
var dbclient    =   require('mongodb').MongoClient;
var database;
var friend_collection;
dbclient.connect("mongodb://localhost:27017/sgrdatabase_test",
  function(err, db) {
    if (!err) {
      database = db;
      friend_collection = db.collection('friends');
    }
  }
);

app.get('/', function(req, res) {
  res.send('Hey There');
});

app.get('/blog', function(req, res){
  res.send('You have reached my blog');
});

app.get('/friends', function(req, res) {
  friend_collection.find().toArray(function(err, items){
    res.send(JSON.stringify({"friends":items}));
  });
});

app.listen(3000, function() {
  console.log('Listening on port 3000');
});
