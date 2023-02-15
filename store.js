//usando mocks para simular base de datos

// const { response } = require("express");
require("dotenv").config();
const { default: mongoose } = require("mongoose");
const db = require("mongoose"); //const list = []; guardamos los mensajes
const model = require("./model");

db.Promise = global.Promise; //pedimos a mongoose que use las promesas en lugar de callbacks.
//global en un objeto especifico de javascript de node.js que nos permite acceder a scope global y dentro de hay va a estar Promise que es nativo de js que funciona como libreria. Asi se usara promesas de global y no nativas

new Promise(() => {
  try {
    db.connect(process.env.DB_USER);
    //db.conect("mongodb+srv://portafolio.tjophe6.mongodb.net/test?authMechanism=DEFAULT",{ userNewParser: true } no habra problems de compatibilidad )
    console.log("[db] conectado con exito");
  } catch (error) {
    console.log(error);
  }
});

function addMessage(usermsg) {
  //recibira el mensaje
  // list.push(usermsg);
  const myMessage = new model(usermsg); //agarra el mensaje
  myMessage.save((err) => {
    if (err) throw new Error(`Error en la escritura:${err}`);
    console.log("Escritura OK");
  }); //guarda el mensaje
  // console.log("Elementos de la lista:", list);
}

/*---Para devolero a la app myMessage---*/

async function getMessages() {
  // esta funcion es asincrona porque es necesario que termine de ejecutarse esta funcion antes de continuar con el resto del codigo
  const mensajes = await model.find({}, (err) => {
    //BUSCA EN TODOS LOS DOCUMENTOS {}
    //el metodo .find puede tomar mucho tiempo por eso se usa sync await, se debe esperar a que termine de buscar en la db
    if (err) throw new Error(`Error en la escritura:${err}`);
    console.log("Lectura OK"); //busca en todos los archivos
  });
  mensajes(); //lo que devuelve es la  lectura de model
}

// function getMessages() {
//   console.log("funca getMessages store");
//   return list;
// }
async function updateText(id, usermsg) {
  id = new mongoose.Types.ObjectId();
  const foundMessages = await model.findOne({ _id: id });

  foundMessages.usermsg = usermsg;
  const newMessage = await foundMessages.save();
  return newMessage;
}

module.exports = {
  add: addMessage,
  list: getMessages,
  updateText: updateText,
};
