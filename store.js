//usando mocks para simular base de datos

// const { response } = require("express");

const db = require("mongoose"); //const list = []; guardamos los mensajes

db.Promise = global.Promise;

db.connect("mongodb+srv://portafolio.tjophe6.mongodb.net/test?authMechanism=DEFAULT", { userNewParser: true });

console.log("[db] conectado con exito");

function addMessage(usermsg) {
  //recibira el mensaje
  // list.push(usermsg);
  const myMessage = new model(usermsg);
  myMessage.save();
  // console.log("Elementos de la lista:", list);
}

async function getMessages() {
  const usermsg = await model.find();
  return usermsg;
}
// function getMessages() {
//   console.log("funca getMessages store");
//   return list;
// }
module.exports = {
  add: addMessage,
  list: getMessages,
};
// if () {
//   console.log("Elementos de la lista:", list);
// } else {
//   console.log("No se agarro el objeto");
// }
