//usando mocks para simular base de datos

// const { response } = require("express");

const list = []; //guardamos los mensajes

function addMessage(usermsg) {
  //recibira el mensaje
  list.push(usermsg);
  console.log("Elementos de la lista:", list);
}

function getMessages() {
  console.log("funca getMessages store");
  return list;
}
module.exports = {
  add: addMessage,
  list: getMessages,
};
// if () {
//   console.log("Elementos de la lista:", list);
// } else {
//   console.log("No se agarro el objeto");
// }
