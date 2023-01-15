//-----exportamos módulo de express-----//
const express = require("express"); // requerimos express.
// const bodyParser = require("body-parser"); //requiere el middlware de bodyParcer. Se encarga de agregar a nuestro request el campo body de acuerdo al tipo de contenido (texto) enviado en las cabeceras http.
// const { query } = require("express");
const router = express.Router(); // para permitir separar por cabecera, url (ordena las diferentes rutas)

//-----inicializar express-----//
var app = express(); //pasamos parametros a express. Con app le pasamos todo

//-----variables de entorno-----//
console.log("__dirname", __dirname); //ruta de donde parte mi app

//-----Rutas-----//
app.use(express.static("public")); // me habilita el uso de paguinas estaticas
// app.use(bodyParser.json()); //si o si especificar que tipo de datos leer, en este caso, json
app.use(express.urlencoded({ extended: true }));
app.use(express.json);
app.use(router); //middleware de Router. Este uso del router debe ir al final de cada uso de app.

router.get("/", function (request, response) {
  //Express traduce las cadenas de ruta (/) a expresiones regulares, que se utilizan internamente para hacer coincidir las solicitudes entrantes.
  response.send("hola desde get");
  response.sendFile(__dirname + "..public/index.html");
  console.log(request.body);
});
router.post("/recibir", function (req, res) {
  response.sendFile(__dirname + "..public/index.html");
  console.log(req.body); //desde INSOMNIA le agrego un json y lo devuelve
  console.log(req.query);
  // res.send("hola desde post " + req.query);
});
router.all("*", function (req, res) {
  let url = req.url;
  let method = req.method;
  res.send(`<h3>La ${url} del method ${method}`);
});
// app.use('/', (req, res)
//     res.send('Hola')
// })

//-----Escuchar server-----//
const PORT = process.env.PORT || 5500;
app.listen(PORT, () =>
  console.log(`Servidor conectado, escuchando el puerto ${PORT}`)
); //escucha el puerto y recibe un callback;
