var socket = io();


let usermsg = document.getElementById("usermsg");
let errorU = document.getElementById("user-error");
let output = document.getElementById("output");
let actions = document.getElementById("actions");
let sendMessage = document.getElementById("send");
let listU = document.getElementById("list-user");

let usuario = localStorage.getItem('usuario');
let usuariosConectados2 = [];

sendMessage.addEventListener("click", function () {
    socket.emit('EnviarMensaje', {
        usuario: usuario,
        usermsg: usermsg.value
    });

});
socket.on('welcome', function (data) {

    socket.emit('i am client', { usuario: usuario, id: data.id });//emite datos con el nombre de i am cliet

});

usermsg.addEventListener("keypress", function () {
    socket.emit("typing", usuario);
});

socket.on("EnviarMensaje", function (data) {
    console.log(data);
    actions.innerHTML = "";
    output.innerHTML += `<p><strong>${data.usuario} </strong>: ${data.usermsg}</p>`;
});

socket.on("typing", (data) => {
    actions.innerHTML = `<p><em>${data} Esta escribiendo...</em>  </p>`;
    setTimeout(borrarMensaje, 500);//borra mensaje en 100ms
});
function borrarMensaje() {
    actions.innerHTML = "<p>&nbsp;</p>";
}

fetch("./transmitidos").then((uu) => { return uu.json(); }).then((algo) => {

    algo.reverse().forEach(mensajes => {
        const parrafo = document.createElement("p");
        parrafo.textContent = mensajes.todo;
        // console.log("funca", mensajes.todo);
        output.appendChild(parrafo);
    });
    //agarra lo que esta en transmitidos, los convierte en json y lo manda al output al reves que esta en transmitidos.
});

socket.on("titulo", (data) => {
    data.forEach((user) => {
        const parrafo = document.createElement("p");
        parrafo.textContent = user;
        console.log("data.usuario", user);
        listU.appendChild(parrafo);
    });
});
