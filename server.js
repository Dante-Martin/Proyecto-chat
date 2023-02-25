require("dotenv").config();
//-----exportamos módulo de express-----//
const express = require("express"); // requerimos express.

//const bodyParser = require("body-parser"); //requiere el middlware de bodyParcer. Se encarga de agregar a nuestro request el campo body de acuerdo al tipo de contenido (texto) enviado en las cabeceras http. ya esta adentro de express
// const { query } = require("express");

const router = express.Router(); // para permitir separar por cabecera, url (ordena las diferentes rutas)

const controller = require("./controller"); //puedo acceder a controlle.js

//-----inicializar express-----//
var app = express(); //pasamos parametros a express. Con app le pasamos todo

//-----variables de entorno-----//
console.log("__dirname", __dirname); //ruta de donde parte mi app

function success(req, res, message, status) {
  res.status(status || 200).send({
    error: "",
    body: message,
  });
}

function error(req, res, message, status, details) {
  console.log("[Error]" + details);
  res.status(status || 500).send({
    error: message,
    body: "",
  });
}

//-----Rutas-----//
app.use(express.json()); //si o si especificar que tipo de datos leer, en este caso, json
app.use(express.urlencoded({ extended: true })); //fundamental para recibir desde formulario
app.use(express.static("public")); // me habilita el uso de paguinas estaticas
app.use(router); //middleware de Router. Este uso del router debe ir al final de cada uso de app.

router.get("/hola", function (request, response) {
  //Express traduce las cadenas de ruta (/) a expresiones regulares, que se utilizan internamente para hacer coincidir las solicitudes entrantes.
  response.send("hola desde get");
  //response.sendFile(__dirname + "..public/index.html");
  console.log(request.body);
});


router.get("/message", function (req, res) {
  //para filtrar
  //const filter = req.query.user || null;
  //
  controller
    .getMessages()
    .then((list) => {
      //El método then() se utiliza con la llamada de retorno cuando la promesa se cumple o resuelve con éxito.
      // console.log("muestro:", list);
      success(req, res, list, 200); //puede que este mal
    })
    .catch((e) => {
      error(req, res, "error al obtener mensajes", 500, e);
    });
  // res.status(500).send("Error inestperado desde el get");
  // console.log(getMessages());
  // console.log(list);
});

router.post("/mensajear", function (req, res) {
  console.log("del post:", req.body.user);

  controller
    .addUser(req.body.user)
    .then(() => {

      res.sendFile(__dirname + "/public/chat.html");
      // success(req, res, fullMessage, 201);
    })
    .catch((e) => {
      error(req, res, `detalles del error ${e}`, 500, e);

    });

});

router.post("/mensajear2", function (req, res) {
  console.log("del post:", req.body);
  // console.log(JSON.stringify(req.params)); //desde INSOMNIA le agrego un json y lo devuelve
  //  console.log(req);
  controller
    .addMessage(req.body.user, req.body.usermsg)
    .then((fullMessage) => {
      success(req, res, fullMessage, 201);
      // res.status(201).sendFile(req, res, "Creado correctamente");
    })
    .catch((e) => {
      error(req, res, `detalles del error ${e}`, 500, e);
      // res.status(400).send("Error inestperado");
    });
  // res.send("hola desde post " + req.body.usermsg + req.body.user); aparece un error: "Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client" porque se mando dos .send y se bloquea el envio al cliente.
});
router.get("/", function (request, response) {
  //Express traduce las cadenas de ruta (/) a expresiones regulares, que se utilizan internamente para hacer coincidir las solicitudes entrantes.

  response.sendFile(__dirname + "/public/index.html");
  console.log(request.body);
});

router.patch("/message:id", function (req, res) {
  //actializar datos
  controller
    .updateMessages(req.params.id, req.body.usermsg)
    .then((data) => {
      success(req, res, data, 200);
    })
    .catch((e) => {
      error(req, res, "No hay cambiosaprobados", 500, e);
    });
});
// -----------------------------------------------
router.get("/transmitidos", function (req, res) {
  console.log(controller.dame10());
  controller.dame10()
    .then((q) => {
      res.send(q);
    });
});
// --------------------------------------------------
router.all("*", function (req, res) {
  let url = req.url;
  let method = req.method;
  res.send(`<h3>La ${url} del method ${method} no se encuentra disponible`);
});
// app.use('/', (req, res)
//     res.send('Hola')
// })

//-----Escuchar server-----//
const PORT = process.env.PORT || 5500;

const server = app.listen(PORT, () =>
  console.log(`Servidor conectado, escuchando el puerto ${PORT}`)
); //escucha el puerto y recibe un callback

// ---websockets--//
const SocketIo = require("socket.io");
const io = SocketIo(server); //permito la comunicacion bidireccional en server
let usuariosConectados = [];
let allSockets = [];

io.on('connection', (socket) => { //escucho el connectionevento en busca de sockets entrantes y lo registro en la consola.
  console.log("conexion con socket.io");

  socket.emit('welcome', { id: socket.id });
  socket.on('i am client', (e) => { //escucha los detos de i am cliet
    allSockets.push(e.id);
    usuariosConectados.push(e.usuario);
    console.log(allSockets);
    console.log(usuariosConectados);

  });
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data); //le envio un mensajes a todos menos a mi
  });
  socket.on('disconnect', (e) => {

    let cual = allSockets.indexOf(socket.id);
    allSockets.splice(cual, 1);
    usuariosConectados.splice(cual, 1);
    console.log(`Usuario conectados: ${usuariosConectados}`);
  });
  socket.on("EnviarMensaje", (data) => {
    console.log(usuariosConectados);
    console.log(data);
    io.sockets.emit("EnviarMensaje", data);
    controller.guardarMensaje(data.usuario + ": " + data.usermsg);
    console.log("-" + data.usuario + ": " + data.usermsg + "-");
  });

});
//-----//


//-----//

//---EJEMPLO DE CONECCION CON XHR2 PARA obtener información de una URL sin tener que recargar la página completa---//

var XMLHttpRequest = require("xhr2");

router.get("/jjj", function (request, response) {
  response.send(
    '{  "Sexo": "M",    "Tipo": "ENFERMEDAD",    "Nombre": "alllguien",    "Dni": "33555666",    "Edad": "-5"}'
  );
});

router.get("/jaime", function (request, response) {
  const xhr = new XMLHttpRequest();
  xhr.open("get", "http://localhost:3000/jjj");
  xhr.addEventListener("load", () => {
    if (xhr.status === 200) {
      let respuesta = JSON.parse(xhr.response);
      console.log(respuesta.Tipo);
      response.send(respuesta.Tipo);
    } else {
      let error = {
        type: "Error AJAX status",
        body: xhr.status,
        id: id,
      };
      reject(error);
      //reject('Algo falló')
    }
  });
  xhr.send();
});