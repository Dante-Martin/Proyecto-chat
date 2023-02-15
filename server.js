//-----exportamos módulo de express-----//
require("dotenv").config();

const express = require("express"); // requerimos express.

//const bodyParser = require("body-parser"); //requiere el middlware de bodyParcer. Se encarga de agregar a nuestro request el campo body de acuerdo al tipo de contenido (texto) enviado en las cabeceras http. ya esta adentro de express
// const { query } = require("express");

const router = express.Router(); // para permitir separar por cabecera, url (ordena las diferentes rutas)
var XMLHttpRequest = require("xhr2");

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
router.get("/home", function (request, response) {
  //Express traduce las cadenas de ruta (/) a expresiones regulares, que se utilizan internamente para hacer coincidir las solicitudes entrantes.

  response.sendFile(__dirname + "/public/index.html");
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
      success(req, res, list, 202); //puede que este mal
    })
    .catch((e) => {
      error(req, res, "error al obtener mensajes", 500, e);
    });
  // res.status(500).send("Error inestperado desde el get");
  // console.log(getMessages());
  // console.log(list);
});

router.post("/recibir", function (req, res) {
  console.log(JSON.stringify("del post:", req.body));

  // console.log(JSON.stringify(req.params)); //desde INSOMNIA le agrego un json y lo devuelve
  //  console.log(req);

  controller
    .addMessage(req.body.user, req.body.usermsg)
    .then((fullMessage) => {
      success(req, res, fullMessage, 201);
      // res.status(201).sendFile(req, res, "Creado correctamente");
    })
    .catch((e) => {
      error(req, res, "detalles del error", 500, e);
      // res.status(400).send("Error inestperado");
    });

  // res.send("hola desde post " + req.body.usermsg + req.body.user); aparece un error: "Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client" porque se mando dos .send y se bloquea el envio al cliente.
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
app.listen(PORT, () =>
  console.log(`Servidor conectado, escuchando el puerto ${PORT}`)
); //escucha el puerto y recibe un callback
