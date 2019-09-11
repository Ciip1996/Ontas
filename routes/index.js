var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index");
});

var mongoCliente = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/alumnos";
//var url = "mongodb://localhost:27017/alumnos";

router.post("/getpoints", (req, res) => {
  console.log("parametros");
  console.log(req.body);

  //https://docs.mongodb.com/manual/reference/operator/query/near/
  let query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(req.body.long), parseFloat(req.body.lat)]
        },
        $maxDistance: parseInt(req.body.distance)
      }
    }
  };

  if (req.body.type && req.body.type != "all") type = req.body.type;

  mongoCliente.connect(url, function(err, db) {
    if (err) throw err;

    db.collection("alumnos")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        res.json(result);
        db.close();
      });
  });
});

router.post("/getDatosAlumno", (req, res) => {
  let query = { photos: { $regex: req.body.matricula } }; 

  mongoCliente.connect(url, function(err, db) {
    if (err) throw err;

    db.collection("alumnos")
      .find(query)
      .toArray(function(err, result) {
        if (err) throw err;
        res.json(result);

        db.close();
      });
  });
});

router.post("/insertChatMessage", (req, res) => {
  var MessageBody = req.body.message;
  var From = req.body.from + ".jpg";
  var To = req.body.to;
  var Time = new Date();

  mongoCliente.connect(url, function(err, db) {
    if (err) {
      throw err;
    }
    db.collection("alumnos").update(
      { photos: From },
      { $push: { messages: { message: MessageBody, to: To, time: Time } } },
      function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      }
    );
  });
});

router.get("/getChatMessagesFromUser", (req, res) => {
  var chatSender = req.query.from;
  var chatDestinatary = req.query.to;

  mongoCliente.connect(url, function (err, db) {
    if (err) throw err;
    /*db.collection("alumnos").find({ photos: { $regex: chatDestinatary } }, function (err, res) {
      if (err) throw err;
    });*/ { messages: 1}
    db.collection("alumnos").find({ 
      photos: 
      { 
        $regex: chatDestinatary 
      }
    }, 
    {
      messages: 1, name: 1
    }).toArray(function (err, result) {
      if (err) {
        throw err;
      }
      res.json(result);
      db.close();
    });

  });
  /*mongoCliente.connect(url, function (err, db) {
    if (err) throw err;
    db.collection("alumnos").find({ photos: { $regex: chatSender } }).toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
      db.close();
    });
  });*/
});

router.post("/insertMarkers", (req, res) => {
  const listMarkers = JSON.parse(req.body.markers);
  console.log("inserting markers");
  console.log(listMarkers);

  mongoCliente.connect(url, function (err, db) {
    if (err) throw err;

    db.collection("alumnos").updateOne(
      { photos: req.body.matricula + ".jpg" },
      {
        $set: { markers: listMarkers }
      }
    );
  });
});

router.post("/shareMarkers", (req, res) => {
  const listMatriculas = JSON.parse(req.body.matriculas);
  const marker = JSON.parse(req.body.marker);

  mongoCliente.connect(url, function(err, db) {
    if (err) throw err;

    listMatriculas.forEach(element => {
      db.collection("alumnos").updateOne(
        { photos: element + ".jpg" },
        {
          $push: { markers: marker }
        }
      );
    });
  });
});

module.exports = router;

/*

router.get('/clusteres', function(req, res, next) {
  res.render('indexClusteres');
});


router.get('/alumnosTodos', function(req, res, next) {
  res.render('indexTodos');
});


router.post("/getpointsAll", (req, res)=> {



    //https://docs.mongodb.com/manual/reference/operator/query/near/
    let query = {};


    mongoCliente.connect(url, function(err,db){
    if (err) throw err;

    db.collection("alumnos").find(query).toArray(function(err,result){
        
        if (err) throw err;

        res.json(result); 
        
        db.close();
    });
    
   });

});

*/
