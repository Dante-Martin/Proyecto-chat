//usando mocks para simular base de datos

const list = []; //guardamos los mensajes

function addMessage(usermsg) {
  //recibira el mensaje
  list.push(usermsg);
}

function getMessages() {
  return list;
}
module.exports = {
  add: addMessage,
  list: getMessages,
};
