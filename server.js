//-----exportamos módulo de express-----//
require('dotenv').config();
const express = require("express"); // requerimos express.
//const bodyParser = require("body-parser"); //requiere el middlware de bodyParcer. Se encarga de agregar a nuestro request el campo body de acuerdo al tipo de contenido (texto) enviado en las cabeceras http. ya esta adentro de express
// const { query } = require("express");

const router = express.Router(); // para permitir separar por cabecera, url (ordena las diferentes rutas)
var XMLHttpRequest = require("xhr2");

//-----inicializar express-----//
var app = express(); //pasamos parametros a express. Con app le pasamos todo

//-----variables de entorno-----//
console.log("__dirname", __dirname); //ruta de donde parte mi app

//-----Rutas-----//
app.use(express.json()); //si o si especificar que tipo de datos leer, en este caso, json
app.use(express.urlencoded({ extended: true }));//fundamental para recibir desde formulario
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


router.post("/recibir", function (req, res) {
  console.log(JSON.stringify(req.body));

  // console.log(JSON.stringify(req.params)); //desde INSOMNIA le agrego un json y lo devuelve
  //  console.log(req);
  res.send("hola desde post " + req.body.usermsg);
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor conectado, escuchando el puerto ${PORT}`)
); //escucha el puerto y recibe un callback

