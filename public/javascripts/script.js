        //35px
        function mostrarUsuarios(id) {
            var dato = document.getElementById(id).getAttribute("data-abierto");
            if (dato == "0") {
                document.getElementById(id).setAttribute("data-abierto", "1");
                $("#" + id).removeClass("glyphicon-menu-down");
                $("#" + id).addClass("glyphicon-menu-up");
                document.getElementById("usuariosLogeados").style.maxHeight = "35px";
            } else {
                document.getElementById(id).setAttribute("data-abierto", "0");
                $("#" + id).removeClass("glyphicon-menu-up");
                $("#" + id).addClass("glyphicon-menu-down");
                document.getElementById("usuariosLogeados").style.maxHeight = "150px";

            }
            console.log(dato)
        }
