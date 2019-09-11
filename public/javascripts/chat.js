socket = io();

socket.on("disconnect", () => {
  console.log("you have been disconnected");
});

socket.on("usuarios", data => {
  $("#usuariosLinea").html("");

  data.forEach(d => {
    //si hay uno repetido no lo agregue

    if (d.matricula != sessionStorage.getItem("matricula")) {
      $("#usuariosLinea").append(
        "<div onclick=\"IniciarChatCon('" +
          d.matricula +
          "');\" id='" +
          d.matricula +
          "' style='height: 35px;border-bottom: 1px solid #d7dadc;cursor: pointer;'>" +
          "  <div style='float:left'>" +
          "<div class='chat-profile-image' style='background-image: url(/images/Estudiantes/" +
          d.img +
          ");' />" +
          "  </div> " +
          "  <div style='float: left;padding-left: 15px;line-height: 35px;'>" +
          d.nombre +
          "</div> " +
          "  <div style='clear:both'></div> " +
          "  </div>"
      );
    }
  });
  console.log(data);
});

socket.on("usuarioLogeado", data => {
  console.log(data);

  if (sessionStorage.getItem("matricula") != null) {
    if (sessionStorage.getItem("matricula") != data.matricula) {
      toastr.success("Entró el usuario " + data.nombre, "Usuarios");
    }
  } else {
    toastr.success("Entró el usuario " + data.nombre, "Usuarios");
  }
});

socket.on("disconnect", () => {
  console.log("you have been disconnected");
});

socket.on("marcadores", data => {
  console.log(data);
});

socket.on("mensaje", (usuario, mensaje, usuarioDestino, idMensaje) => {
  if (sessionStorage.getItem("matricula") != null) {
    if (usuarioDestino == sessionStorage.getItem("matricula")) {
      //Verifica si ya existe un elemento del chat
      if (document.getElementById(idMensaje) == null) 
      {
        crearNuevaVentanaChat("R", idMensaje, usuario);
      }
      else{ //reload the chat content
        var msg =
          '<div class="row msg_container base_receive"> ' +
          ' <div class="col-md-2 col-xs-2 avatar"> ' +
          '     <span class="glyphicon glyphicon-user" aria-hidden="true" style="font-size: 35px;"></span>  ' +
          " </div> " +
          ' <div class="col-md-10 col-xs-10 drop_window"> ' +
          '     <div class="messages msg_receive drop_target"> ' +
          "         <p>" +
          usuario +
          ":" +
          mensaje +
          "  </p> " +
          '         <time datetime="2009-11-13T20:00">Timothy • 51 min</time> ' +
          "     </div> " +
          " </div> " +
          " </div> ";

        $("#" + idMensaje)
          .append(msg)
          .animate({ scrollTop: $("#" + idMensaje).prop("scrollHeight") }, 0);
      }
    }
  }
  console.log(usuario);
  console.log(mensaje);
  console.log(usuarioDestino);
  console.log(idMensaje);
});

function salirSistema() {
  if (sessionStorage.getItem("matricula") != null) {
    sessionStorage.removeItem("matricula");

    socket.emit("disconnect", socket);

    window.location.reload();
  }
}

function crearNuevaVentanaChat(tipo, uiidMsg, idUsuario) {
  // tipo =  E (Emisor), R (Receptor)------- uiidMsg para poderChatear

  /* look into the database the chat with the user idUsuario */

  var uuidChat = UUID.generate();

  var uuidMensaje = "";

    if (uiidMsg != null) {  //Esto es para el receptor en el supuesto de que el no iniciara el dialogo con el chat
        uuidMensaje = uiidMsg;
    } else {
        uuidMensaje = UUID.generate();
    }
    var TemplateHtmlChat = ' <div class="borderChat boxShadowChat" id="' + uuidChat + '" style="width: 225px;height: 230px;border:0px solid #ccc;position:relative;bottom:  0px;z-index: 9;background: #fff;max-height: 230px;-webkit-transition: max-height 0.8s;-moz-transition: max-height 0.8s;transition: max-height 0.8s;float:left;margin-left: 20px;">' +
    ' <div class="borderChat" style="border: 0px solid #ccc;height: 35px;background-color: rgb(51, 122, 183);"> ' +
    '     <span style="padding-left: 25px;padding-top: 9px;position: absolute;color: #FFF;">Usuarios</span>' +
    ' <span class="glyphicon glyphicon-user" style="font-size: 15px;padding-top: 10px;position: absolute;padding-left: 5px;color: #FFF;"></span>' +
    '     <span  onclick=\"eliminarChat(\'' + uuidChat + '\');\" id="barraChatUsuarios" data-abierto="1" class="glyphicon glyphicon-remove" style="color: #fff;position: absolute;right: 0px;padding-top: 10px;padding-right: 10px;cursor: pointer;"></span>' +
    ' </div>' +
    ' <div id="' + uuidMensaje + '" style="height: 100%;padding: 15px;overflow-y:  scroll;max-height: 160px;">' +
    ' </div>' +
    ' <div style="border-top: 1px solid #ccc;"> ' +
    '    <input id="msg-' + uuidMensaje + '" type="text" style="width: 70%;font-size: 22px;border: 0px solid #ccc;"> ' +
    '        <input type="button" name="btnEnviar" value="Enviar" style="border: 1px solid #ccc;font-size: 15px;padding-top: 5px;" onclick=\"MandarMensaje(\'' + uuidMensaje + '\');\"> ' +
    '    </div>' +
    ' <input type="hidden" id="idChat" data-idMensaje="' + uuidMensaje + '" /> ' +
    ' <input type="hidden" id="idUsuario-' + uuidMensaje + '" data-idUsuario="' + idUsuario + '" /> ' +
    ' </div>';
    $("#contenidoChat").append(TemplateHtmlChat);

    /* get array of messages from db */
    var chatUser =  idUsuario;
    var loggedUser  =  sessionStorage.getItem("matricula");

    let messsagesReceived = [];
    let messsagesSent = [];
    $.when( 
      $.ajax({
        type: "GET",
        url: "/getChatMessagesFromUser",
        data: { from: loggedUser, to: chatUser},
        success: function(data) {
            messsagesReceived = data;
        },
        error: function(xhr, status, error){
            var stack = xhr.stack;
            var errorMessage = xhr.status + ': ' + xhr.statusText;
            toastr.error('The following error was found: ' + errorMessage);
        },
        dataType: "json"
      }),$.ajax({

        type: "GET",
        url: "/getChatMessagesFromUser",
        data: { from: chatUser, to: loggedUser},
        success: function(data) {
            messsagesSent = data;
        },
        error: function(xhr, status, error){
            var stack = xhr.stack;
            var errorMessage = xhr.status + ': ' + xhr.statusText;
            toastr.error('The following error was found: ' + errorMessage + stack);
        },
        dataType: "json"
      })
    ).then( ()=> {
      var data = {
        "messsagesSent": messsagesSent,
        "messsagesReceived": messsagesReceived
      };
      paintMessages(uuidMensaje, data, chatUser);
    }, function error (xhr, status, error){
      var stack = xhr.stack;
      var errorMessage = xhr.status + ': ' + xhr.statusText;
      toastr.error('The following error was found: ' + errorMessage + stack);
    });

}

function paintMessages(_idMensaje, data, To){
  var usuario = sessionStorage.getItem("matricula");
  //var messages = data.messsagesSent[0].messages;
  let filteredMessagesSent = data.messsagesSent[0].messages.filter(m => m.to === To);
  let filteredMessagesReceived = data.messsagesReceived[0].messages.filter(m => m.to === usuario);
  
  var allMessages = [...filteredMessagesSent, ...filteredMessagesReceived];
  debugger;
  //var allMessages = [{ transportnumber: '45', time: '10:28:00', date:"2017-01-16"}, { transportnumber: '45', time: '10:38:00', date:"2017-01-16" },{ transportnumber: '45', time: '10:48:00', date:"2017-01-16" }, { transportnumber: '14', time: '10:12:00', date:"2017-01-16" }, { transportnumber: '14', time: '10:24:00', date:"2017-01-16" }, { transportnumber: '14', time: '10:52:00', date:"2017-01-16"}];
  allMessages.sort(function (a, b) {
      return a.time.localeCompare(b.time);
  });
    //m => m.to === usuario);

  //pending logic to sort by time
  allMessages.forEach(d => {
    var now = new Date();
    var then = new Date(d.time);

    var diffMs = (then - now); // milliseconds between now & Christmas
    var diffMins = Math.abs(Math.round(((diffMs % 86400000) % 3600000) / 60000)); // minutes
    var diffHrs = Math.abs(Math.floor((diffMs % 86400000) / 3600000)); // hours
    var diffMins = Math.abs(Math.round(((diffMs % 86400000) % 3600000) / 60000)); // minutes
    var timeAgo = diffHrs + " hrs " + diffMins + "minutes ago.";
    
    if(d.to !== usuario)
    {
      var msg =
      '<div class="row msg_container base_sent"> ' +
      ' <div class="col-md-10 col-xs-10"> ' +
      '     <div class="messages msg_sent"> ' +
      "         <p>" +
      d.message +
      "  </p> " +
      '         <time datetime="'+ d.time+'">'+usuario+' • '+ timeAgo +'</time> ' +
      "     </div> " +
      " </div> " +
      ' <div class="col-md-2 col-xs-2 avatar"> ' +
      '   <span class="glyphicon glyphicon-user" aria-hidden="true" style="font-size: 35px;"></span> ' +
      " </div> " +
      " </div> ";
      $("#" + _idMensaje).append(msg).animate({ scrollTop: $("#" + _idMensaje).prop("scrollHeight") }, 0);
      document.getElementById("msg-" + _idMensaje).value = "";
    }
    else{//received
      var msg =
      '<div class="row msg_container base_receive"> ' +
      ' <div class="col-md-2 col-xs-2 avatar"> ' +
      '     <span class="glyphicon glyphicon-user" aria-hidden="true" style="font-size: 35px;"></span>  ' +
      " </div> " +
      ' <div class="col-md-10 col-xs-10 drop_window"> ' +
      '     <div class="messages msg_receive drop_target"> ' +
      "         <p>" +
      d.message  +
      "  </p> " +
      '         <time datetime="'+ d.time+'">'+To+' • '+ timeAgo +'</time> ' +
      "     </div> " +
      " </div> " +
      " </div> ";

      $("#" + _idMensaje).append(msg).animate({ scrollTop: $("#" + _idMensaje).prop("scrollHeight") }, 0);
    }

  });
}

function eliminarChat(id) {
  $("#" + id).remove();
}

function IniciarChatCon(idUsuarioDestino) {
  crearNuevaVentanaChat("E", null, idUsuarioDestino);
}

function MandarMensaje(_idMensaje) {
  var mensaje = document.getElementById("msg-" + _idMensaje).value;
  var usuarioDestino = document
    .getElementById("idUsuario-" + _idMensaje)
    .getAttribute("data-idUsuario");
  var usuario = sessionStorage.getItem("matricula");
  var idMensaje = _idMensaje;
  /* send to mongo db the message */
  $.ajax({
    type: "POST",
    url: "/insertChatMessage",
    data: { message: mensaje, from: usuario, to: usuarioDestino },
    success: function(data) {
      console.log("succesful");
    },
    error: function(xhr, status, error) {
      var errorMessage = xhr.status + ": " + xhr.statusText;
      toastr.error("The following error was found: " + errorMessage);
    },
    dataType: "json"
  });

  socket.emit("mensaje", usuario, mensaje, usuarioDestino, idMensaje);

  var msg =
    '<div class="row msg_container base_sent"> ' +
    ' <div class="col-md-10 col-xs-10"> ' +
    '     <div class="messages msg_sent"> ' +
    "         <p>" +
    usuario +
    ":" +
    mensaje +
    "  </p> " +
    '         <time datetime="2009-11-13T20:00">Timothy • 51 min</time> ' +
    "     </div> " +
    " </div> " +
    ' <div class="col-md-2 col-xs-2 avatar"> ' +
    '   <span class="glyphicon glyphicon-user" aria-hidden="true" style="font-size: 35px;"></span> ' +
    " </div> " +
    " </div> ";

  $("#" + _idMensaje)
    .append(msg)
    .animate({ scrollTop: $("#" + _idMensaje).prop("scrollHeight") }, 0);

  document.getElementById("msg-" + _idMensaje).value = "";
}
