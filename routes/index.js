var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index");
});

var mongoCliente = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/alumnos";

router.post("/getpoints", (req, res) => {
  debugger;
  // console.log("parametros");
  // console.log(req.body);

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
        console.log(result);

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
        // console.log(result);
        res.json(result);

        db.close();
      });
  });
});

router.post("/insertMarkers", (req, res) => {
  // console.log(req);
  const listMarkers = JSON.parse(req.body.markers);
  console.log("HOLA MUNDO VIEJO");
  console.log(listMarkers);

  mongoCliente.connect(url, function(err, db) {
    if (err) throw err;
    console.log(req.body);

    db.collection("alumnos").updateOne(
      { photos: req.body.matricula + ".jpg" },
      {
        $set: { markers: listMarkers }
      }
    );
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
        console.log(result);

        res.json(result); 
        
        db.close();
    });
    
   });

});

*/
