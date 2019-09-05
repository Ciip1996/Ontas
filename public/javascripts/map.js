var map;
var infowindow;
var laSalleBajio = { lat: 21.150908, lng: -101.71110470000002 };
var currentMarkers = [];
var customMarker = null;

socket.on("disconnect", () => {
  console.log("you have been disconnected");
});

function showDialog() {
  BootstrapDialog.show({
    id: "loginModal",
    size: BootstrapDialog.SIZE_SMALL,
    title: "Inicio de Sesión",
    message: $(
      '<input id="txtMatricula" type="number" class="form-control" placeholder="Digite su matrícula para iniciar sesión"></input>'
    ),
    buttons: [
      {
        label: "Consultar",
        cssClass: "btn-primary",
        hotkey: 13, // Enter.
        action: function(dialog) {
          var matricula = document.getElementById("txtMatricula").value;
          consultaMatricula(matricula, dialog);
        }
      }
    ]
  });
}

function initMap() {
  showDialog();

  map = new google.maps.Map(document.getElementById("map"), {
    center: laSalleBajio,
    zoom: 15
  });

  //Evento de agregar marcador por el usuario logeado
  google.maps.event.addListener(map, "click", function(event) {
    BootstrapDialog.show({
      size: BootstrapDialog.SIZE_SMALL,
      title: "Agregar marcador",
      message: $(
        '<input type="text" id="txtTitulo" class="form-control" placeholder="Captura un titulo..."/> </br><input type="text" id="txtDescripcion" class="form-control" placeholder="Captura tu descripcion..."/>'
      ),
      buttons: [
        {
          label: "Insertar",
          cssClass: "btn-primary",
          hotkey: 13, // Enter.
          action: function(dialog) {
            var title = document.getElementById("txtTitulo").value;
            var description = document.getElementById("txtDescripcion").value;
            var item = {
              name: title,
              description: description,
              location: event.latLng
            };
            createMarker(item, null);
            //socket.emit("",usuario, marker);// send the data to mongo db
            dialog.close();
          }
        }
      ]
    });
  });
  //Inicializador Toast:
  toastr.options.positionClass = "toast-top-right";
  toastr.options.extendedTimeOut = 0; //1000;
  toastr.options.timeOut = 3000;
  toastr.options.fadeOut = 250;
  toastr.options.fadeIn = 250;
}

function consultaMatricula(matricula, dialog) {
  $.ajax({
    type: "POST",
    url: "/getDatosAlumno",
    data: { matricula: matricula },
    success: function(data) {
      if (data.length > 0) {
        console.log("Hola undo");
        // only enter if there are users with that id
        dialog.close();
        console.log(data);
        sessionStorage.setItem("matricula", matricula);
        sessionStorage.setItem("mongoId", data[0]._id);
        //marcadoresUsuarioActual = data[0].markers;

        class Usuario {
          constructor(img, nombre, matricula) {
            this.nombre = nombre;
            this.matricula = matricula;
            this.img = img;
          }
        }

        socket.emit("agrega usuario",new Usuario(data[0].photos[0], data[0].name, matricula));

        customMarker = new google.maps.Marker({
          map: map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: laSalleBajio,
          icon: "/images/Estudiantes/" + data[0].photos[0]
        });

        customMarker.addListener("click", function(event) {
          if (customMarker.getAnimation() !== null) {
            customMarker.setAnimation(null);
          } else {
            customMarker.setAnimation(google.maps.Animation.BOUNCE);
          }
        });

        customMarker.addListener("dragend", function(event) {
          clearMarkers();
          //console.log(event);
          getPoints(event.latLng.lng(), event.latLng.lat(), 800, "all");
        });

        //MOSTRAR MARCADORES DEL USUARIO
        data[0].markers.forEach(item => {
          var myLatLng = {lat: item.position[1], lng: item.position[0]};        
          
          var marker = new google.maps.Marker({
            position: myLatLng,
            map: map,
            title: item.title,
            icon: null,
            description: "Description here!"
          });
          
          currentMarkers.push(marker);
          
          showMarker(marker, null);
        });
      }
      else{
        toastr.error("No user was found please try again.");
        document.getElementById("txtMatricula").value = "";
      }
    },error: function(xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      toastr.error("The following error was found: " + errorMessage);
    },
    dataType: "json"
  });
}

function clearMarkers() {
  currentMarkers.forEach(m => m.setMap(null));
  currentMarkers = [];
}

function getPoints(long, lat, distance, type) {
  if (long == 0) long = laSalleBajio.lng;
  if (lat == 0) lat = laSalleBajio.lat;
  if (distance == 0) distance = 1000000000;
  $.ajax({
    type: "POST",
    url: "/getpoints",
    data: { long: long, lat: lat, distance: distance, type: type },
    success: function(data) {
      data.forEach(p => {
        if (p._id != sessionStorage.getItem("mongoId")) {
          p.location.lng = p.location.coordinates[0];
          p.location.lat = p.location.coordinates[1];
          let icon;
          if (p.type == "Estudiante") {
            p.photos[0] = "/images/Estudiantes/" + p.photos[0];
            icon = p.photos[0];
          }
          createMarker(p, icon);
        }
      });
    },
    dataType: "json"
  });
}

function saveMarkersInDB() {
  console.log(currentMarkers);
  $.ajax({
    type: "POST",
    url: "/insertMarkers",
    data: {
      matricula: "60122",
      markers: JSON.stringify(
        currentMarkers.map(item => {
          return {
            title: item.title,
            coordinates: {
              lat: item.position.lat(),
              lng: item.position.lng()
            }
          };
        })
      )
    },
    success: function(data) {
      alert("Marcadores del usuairo " + currentMarkers);
    },
    dataType: "json"
  });
}

function createMarker(item, icon) {
  if(item.location.coordinates){
    item.location.position = item.location.coordinates;
  }
  if(icon){
    var image = {
      url: icon,
      scaledSize: new google.maps.Size(80, 80), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    };
  }

  var marker = new google.maps.Marker({
    map: map,
    position: item.location,
    title: item.name,
    icon: image,
    description: item.description
  });
  currentMarkers.push(marker);

  saveMarkersInDB();
  showMarker(marker, icon);
}

const showMarker = (marker, icon) => {
  let newMarker = {
    title: marker.title,
    coordinates: {
      lat: marker.position.lat(),
      lng: marker.position.lng()
    }
  };
  newMarker = JSON.stringify(newMarker);
  console.log(newMarker);
  if (icon != null) {
    var contentString =
      '<div id="content" style="width: 18rem;">' +
      '<img src="' +
      marker.icon.url +
      '" class="card-img-top" alt="..." style="width: 30px;"> ' +
      '<div class="card-body">' +
      '<h5 id="firstHeading"  class="card-title">' +
      marker.title +
      "</h5>" +
      '<p id="firstHeading"  class="card-text"> Lat:' +
      marker.position.lat() +
      "</p>" +
      '<p id="firstHeading"  class="card-text"> Lon:' +
      marker.position.lng() +
      "</p>" +
      "</div>" +
      "</div>";
  } else {
    var contentString =
      '<div id="content" class="card" style="width: 18rem;">' +
      '<img src="images/lupa.png" class="card-img-top" alt="..." style="width: 20px;"> ' +
      '<div class="card-body">' +
      '<h5 id="title"  class="card-title">' +
      marker.title +
      "</h5>" +
      '<p id="firstHeading" class="card-text">' +
      marker.description +
      "</p>" +
      "<button type='button' class='btn btn-primary' onclick='enviarMarker(" +
      newMarker +
      ")'>Enviar marker</button>" +
      "</div>" +
      "</div>";
  }

  var infowindow = new google.maps.InfoWindow({
    content: contentString
  });

  google.maps.event.addListener(marker, "click", function() {
    infowindow.setContent(contentString);
    infowindow.open(map, this);
  });
};
