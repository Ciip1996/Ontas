socket = io();

var usuarios = "";
var matricula = "";
let marker = {};
let sendToUsers = [];

var modal =
  "<div class='modal' tabindex='-1' role='dialog' id='myModal'>" +
  "<div class='modal-dialog' role='document'>" +
  "<div class='modal-content'>" +
  "<div class='modal-header'>" +
  "<h5 class='modal-title'>Usuarios conectados</h5>" +
  "<button type='button' class='close' data-dismiss='modal' aria-label='Close'>" +
  "<span aria-hidden='true'>&times;</span>" +
  "</button>" +
  "</div>" +
  "<div class='modal-body' id='listaUsuarios'>" +
  "LISTA_USUARIOS" + //AQUI VA LISTA DE USUARIOS
  "</div>" +
  "<div class='modal-footer'>" +
  "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Cancelar</button>" +
  "<button type='button' class='btn btn-primary' onclick='enviarTodos()'>Enviar</button>" +
  "</div>" +
  "</div>" +
  "</div>" +
  "</div>";

/**
 * Cuando un usuario se conecta se concatena el html de su foto con nombre de usuario
 * al html del modal.
 */
socket.on("usuarios", data => {
  $("#contenidoModal").html();

  data.forEach(d => {
    if (d.matricula != sessionStorage.getItem("matricula")) {
      usuarios +=
        "<div id='" +
        d.matricula +
        "_modal' style='height: 30px; border-bottom: 1px solid #d7dadc; cursor: pointer;' onclick='select(" +
        d.matricula +
        ")'>" +
        "<div style='float:left'>" +
        "<img src='/images/Estudiantes/" +
        d.img +
        "'style='width: 28px;border-radius: 50%;'/> " +
        "</div> " +
        "<div style='float: left;padding-left: 5px;line-height: 25px;'>" +
        d.nombre +
        "</div> " +
        "<div style='clear:both'></div> " +
        "</div>";
    }
  });

  modal = modal.replace("LISTA_USUARIOS", usuarios);
  console.log(modal);
});

const enviarMarker = marcador => {
  // $("#contenidoModal").append(modal);
  // $("#myModal").modal();
  marker = marcador;

  BootstrapDialog.show({
    id: "sendMarkersModal",
    size: BootstrapDialog.SIZE_SMALL,
    title: "Usuarios conectados",
    message: $(usuarios),
    buttons: [
      {
        label: "Enviar",
        cssClass: "btn-primary",
        hotkey: 13, // Enter.
        action: function(dialog) {
          enviarTodos();
          dialog.close();
        }
      }
    ]
  });
};

/**
 * Metodo para resaltar con color los usuarios seleccionados para mandar
 * el marcador, se guardan en un arreglo las matriculas.
 */
const select = matricula => {
  sendToUsers.forEach((item, index) => {
    if (item == matricula) {
      sendToUsers.splice(index, 1);
      $("#" + matricula + "_modal").css({
        "background-color": "#f5f6fa",
        color: "#000000",
        "border-radius": 10
      });
      return;
    }
  });
  sendToUsers.push(matricula);

  $("#" + matricula + "_modal").css({
    "background-color": "#74b9ff",
    color: "#f5f6fa",
    "border-radius": 10
  });

  console.log(sendToUsers);
};

/**
 * Metodo para mandar objeto a guardar a base de datos
 */
const enviarTodos = () => {
  //FUNCIONALIDAD PARA GUARDAR EN LA BASE DE DATOS
  $.ajax({
    type: "POST",
    url: "/shareMarkers",
    data: {
      matriculas: JSON.stringify(sendToUsers),
      marker: JSON.stringify(marker)
    },
    success: function(data) {
      alert("Marcadores del usuario " + data);
    },
    dataType: "json"
  });
};
