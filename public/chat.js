var socket = io();


let user = document.getElementById("user");
let usermsg = document.getElementById("usermsg");
let errorU = document.getElementById("user-error");
let chat = document.getElementById("chat");
let accessUser = document.getElementById("access");
let sendMessage = document.getElementById("send");
let listU = document.getElementById("list-user");

let usuario = localStorage.getItem('usuario');

sendMessage.addEventListener("click", function () {
    socket.emit('EnviarMensaje', {
        usermsg: usermsg.value,
        usuario: usuario
    });

});
socket.on('welcome', function (data) {

    socket.emit('i am client', { usuario: usuario, id: data.id });

});
