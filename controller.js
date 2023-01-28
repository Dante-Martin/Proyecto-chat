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
    console.log("funca addMessages");
  });
}
function getMessages() {
  return new Promise((resolve, reject) => {
    console.log("funca getMessages_controller");
    resolve(store.list());
    resolve(console.log("store.list:", store.list()));
    reject(console.log("no hay datos"));
  });
}
module.exports = {
  addMessage,
  getMessages,
};

// console.log(store);
// console.log(getMessages);
