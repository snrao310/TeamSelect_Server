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
var user_collection;
var team_collection;

var app         =   express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// Connect to mongo db
dbclient.connect("mongodb://localhost:27017/teamSelectDB",
function(err, db) {
  if (!err) {
    database = db;
    user_collection = db.collection('users');
    team_collection = db.collection('teams');
  }
}
);

// Chained Methods: app.get().get().get().get().post().listen()

app
.get('/users', function(req, res) { // Get all users
  user_collection.find().toArray(function(err, items){
    console.log("Got GET request from client: " + req.connection.remoteAddress);
    res.send(
      JSON.stringify(
        {"users":items}
      )
    );
  });
})
.post('/check', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  console.log(username + " and " + password);
  user_collection.find({"username":username,"password":password}).toArray(function(err, items) {
    var str = JSON.stringify(items[0]);
    if (str != null) {
      res.send("1");
    } else {
      res.send("0");
    }
  });
})
.get('/user/:id', function(req, res) {
  username = req.params.id;
  var str;

  console.log("Got GET request from client: " + req.connection.remoteAddress);


  user_collection.find({"username":username}).toArray(function(err,items){
    var job = items[0];
    delete job.password;
    delete job.latitude;
    delete job.longitude;
    str=JSON.stringify(job);
    console.log(str);
    res.send(str);
  });
})
.post('/filter',function(req, res){
  // URL Format: http://<server>:3000/filter
  console.log(req.body.skillset + "\n");
  console.log(req.body.aoi);
})
.get('/skills/:id/aoi/:id2', function(req, res) {
  // URL Format: http://<server>:3000/skills/ruby&python&java/aoi/bigdata&mobile
  var skills = req.params.id;
  var aoi = req.params.id2;

  // Split the skillset and area of interest strings into an array
  var skillset = skills.toString().split("&");
  var aoiset = aoi.toString().split("&");

  // Now, search the database for people with the skillset and the Area of Interest
  user_collection.find({
    "skillset":{$in:skillset},
    "aoi":{$in:aoiset}
  }).toArray(function(err, items)
  {
    if (!err) {
      console.log("Retrieved data for query");
      res.send(JSON.stringify({"users":items}));
    }
  });
})
.post('/register', function(req, res){ // Create new user
  var username = req.body.username;
  var password = req.body.password;
  var name = req.body.name;
  var location = req.body.location;
  var mail = req.body.mail;
  var phone = req.body.phone;
  var aoi = req.body.aoi;
  var aoi_2 = aoi.toString().split(",");
  var skillset = req.body.skillset;
  var skillset_2 = skillset.toString().split(",");
  var latitude=req.body.latitude;
  var longitude=req.body.longitude;
  var teamwith=[];
  var sentRequests=[];
  var requests=[];

  var jsonobj = { "username":username,
    "password":password,
    "name":name,
    "location":location,
    "mail":mail,
    "phone":phone,
    "aoi":aoi_2,
    "skillset":skillset_2,
    "latitude":latitude,
    "longitude":longitude,
    "teamwith":teamwith,
    "sentRequests": sentRequests,
    "requests":requests
  };

  user_collection.find({"username":username}).toArray(function(err, items) {
    var str = JSON.stringify(items[0]);
    if (str != null) {
      res.send("Username exists");
      console.log("The str is"+str);
    } else {
      console.log("The str is"+str);
      user_collection.insertOne(jsonobj);
      res.send("Created");
    }
  });

  console.log("Got POST request from client: " + req.connection.remoteAddress);
  console.log(JSON.stringify(jsonobj));

})
.post('/update', function(req, res){ // Update user profile
  var username = req.body.username;
  var jsonobj={"username":username};

  var password = req.body.password;
  var name = req.body.name;
  var location = req.body.location;
  var mail = req.body.mail;
  var phone = req.body.phone;
  var aoi = req.body.aoi;
  var skillset = req.body.skillset;
  var latitude=req.body.latitude;
  var longitude=req.body.longitude;
  var jsonobj1={$set:{}};
  var curraoi,currskillset;

  user_collection.find({"username":username}).toArray(function(err,items){
    curraoi=items[0]["aoi"];
    currskillset=items[0]["skillset"];

    console.log(curraoi);
    console.log("\n");
    console.log(currskillset);

    if (aoi!=null) {
      var aoi_arr = aoi.toString().split(",");
      for ( var i = 0; i < aoi_arr.length; i++ ) {
        curraoi.push(aoi_arr[i]);
      }
      jsonobj1.$set["aoi"]=curraoi;
    }

    if (skillset!=null) {
      var skill_arr = skillset.toString().split(",");
      for ( var i = 0; i < skill_arr.length; i++ ) {
        currskillset.push(skill_arr[i]);
      }
      jsonobj1.$set["skillset"]=currskillset;
    }

    user_collection.updateOne(jsonobj,jsonobj1);
  });

  if (password!=null)
    jsonobj1.$set["password"]=password;
    if (name!=null)
      jsonobj1.$set["name"]=name;
  if (location!=null){
    jsonobj1.$set["location"]=location;
    jsonobj1.$set["latitude"]=latitude;
    jsonobj1.$set["longitude"]=longitude;
  }
  if (phone!=null)
    jsonobj1.$set["phone"]=phone;
  if (mail!=null)
      jsonobj1.$set["mail"]=mail;

  console.log(jsonobj);
  user_collection.updateOne(jsonobj,jsonobj1);
  console.log("Got POST request from client: " + req.connection.remoteAddress);
  console.log(jsonobj1);
  res.send('Request from ' + req.connection.remoteAddress + ' create new user, ' + req.body.username);
})

.post('/request',function(req,res){
  var username1=req.body.fromUsername;
  var username2=req.body.toUsername;

  console.log("Request Body: ");
  console.log(JSON.stringify(req.body) + "\n");

  var jsonobj={"username":username1};
  var jsonobj1={$set:{}};


  user_collection.find({"username":username1}).toArray(function(err,items){
    var scurreq=[];
    scurreq=items[0]["sentRequests"];
    //console.log(curreq);
    scurreq.push(username2);
    jsonobj1.$set["sentRequests"]=scurreq;
    user_collection.updateOne(jsonobj,jsonobj1);
  });

  var jsonobj2={"username":username2};
  var jsonobj3={$set:{}};

  user_collection.find({"username":username2}).toArray(function(err,items){
    var currer=[];
    currer=items[0]["requests"];

    currer.push(username1);
    jsonobj3.$set["requests"]=currer;
    user_collection.updateOne(jsonobj2,jsonobj3);
  });
  res.send("1");
}
)
.listen(3000, '0.0.0.0', function() {
  console.log('Listening on port 3000');
});
