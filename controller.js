const store = require("./store");

function addMessage(user, usermsg) {
  return new Promise((resolve, reject) => {
    if (!user || !usermsg) {
      console.error(" No hay usuario o mensaje");
      return reject("Los datos son incorrectos");
    }

    // console.log(user);
    // console.log(usermsg);

    const fullMessage = {
      user: user,
      message: usermsg,
      date: new Date(),
    };
    console.log(fullMessage);
    store.add(fullMessage);
    resolve(fullMessage);
  });
}
function getMessages() {
  return new Promise((resolve, reject) => {
    resolve(store.list());
  });
}
module.exports = {
  addMessage,
  getMessages,
};
