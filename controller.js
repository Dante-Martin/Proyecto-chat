const store = require("./store");

/*---para guardar en BD: "RECOPILADO" que es para que aparezcan mensajes en el chat---*/

function guardarMensaje(que) { //mucho cuidado cuando escribo la funcion, antes puse dos parametros (usuario, usermsg) y cuando llamaba no entendia que era usermsg poruqe solo estaba mandando un solo parametro en server que es donde se envia un parametro concatenado


  const fullMessage = {
    todo: que
  };
  store.GM(fullMessage);

}
async function dame10() {
  return await store.dame10();
  //llamo a dame10
}
/*------------------------------------------------------------------------------------------*/
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
      // id: id,
    };
    console.log(fullMessage);
    store.add(fullMessage);
    resolve(fullMessage);
    console.log("funca addMessages");
  });
}

function addUser(user) {
  return new Promise((resolve, reject) => {
    if (!user) {
      console.error(" No hay usuario ");
      return reject("Los datos son incorrectos");
    }

    // console.log(user);
    // console.log(usermsg);

    const fullMessage = {
      user: user,
    };
    console.log(fullMessage);
    store.addU(fullMessage);
    resolve(fullMessage);
    console.log("funca addUser");
  });
}

function getMessages() {

  return new Promise((resolve, reject) => {
    resolve(store.list());
    console.log("Se recibio correctamente");
    // resolve(store.list());
    // resolve(console.log("store.list:", store.list()));
    // reject(console.log("no hay datos")); aca le digo que simpre falla y cuando lo haga que muestre un mensaje
  });
}

function updateMessages(id, usermsg) {
  return new Promise(async (resolve, reject) => {
    //se esta interactuando con otro método que es asincrono, en este caso los métodos de store. Para obtener los datos de este método debe poner async await. https://eslint.org/docs/latest/rules/no-async-promise-executor
    console.log(id);
    console.log(usermsg);
    if (!id || !usermsg) {
      reject("Datos invalidos");
      return false;
    }

    let texto = await store.updateText(id, usermsg);
    resolve(texto);
  });
}
module.exports = {
  addMessage,
  addUser,
  getMessages,
  updateMessages,
  guardarMensaje,
  dame10,
};

// console.log(store);
// console.log(getMessages);
