const country = { "country": 2, "nombre": "Los Aromos" };
const passworddefault = 123456;

var listacountryhabilitado = new Set([2]);

const timeoutSQL = 100; //cuanto tiempo esperar entre la conexion SQL y la consulta
const https = require('https');
const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const mysql = require('mysql');
var key = fs.readFileSync(__dirname + '/../cert/server.key');
var cert = fs.readFileSync(__dirname + '/../cert/server.crt');
var options = { key: key, cert: cert };
var formidable = require('formidable');
const sharp = require('sharp');

/////////////// algunos seteos conexion SQL y WEB
const conn = mysql.createPool({
    connectionLimit: 3, //important
    host: 'localhost',
    user: 'frombakend',
    password: 'backendpass',
    database: 'aldaba',
    debug: false
});
var fuerzanuevo = 0; //necesario para forzar usar foto nueva en lugar de la que está en cache

var app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
/////////////// fin algunos seteos conexion SQL y WEB


////////////  configuracion WEB
app.use('/assets/', express.static('assets/'))
//app.use('/ejemplo/', express.static('ejemplo/'))
//app.use('/static/', express.static('ejemplo/'))
app.use('/fotos/', express.static('../uploaded/'))
//app.use('/graficos/', express.static('graficos/'))
/*
app.get('/qr-scanner-worker.min.js', function(req, res, next) {
    fs.readFile("assets/js/qr-scanner-worker.min.js", function(err, html) {
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});
*/
app.get('/qr-scanner-worker.min.js.map', function(req, res, next) {
    fs.readFile("assets/js/qr-scanner-worker.min.js.map", function(err, html) {
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});
/*
app.get('*', function(req,res,next) {
    console.log (req.headers);
  if(req.headers['x-forwarded-proto'] != 'https' )
    res.redirect('https://'+req.hostname+req.url)
  else
    next() /* Continue to other routes if we're not redirecting * /
 });

app.get('*', function(req,res,next) {
    console.log (req.headers.host);
    console.log (req.url);
 
});
*/
app.get('/', function(req, res, next) {
    console.log("si");
    fs.readFile("index.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/vigilancia', function(req, res, next) {
    console.log('recibio /vigilancia');
    fs.readFile("vigilancia.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        html_string = html_string.replace("xyzopqdatosdesdeelserver", JSON.stringify(country));
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/vigilancialogin', function(req, res, next) {
    console.log('recibio /vigilancialogin');
    if (req.body.country == undefined || req.body.pass == undefined) {
        return res.json([{ 'error': true }]);
    } else {
        let laquery = "select 1 as resultado from administrativo where nombre='vigilancia' and country=? and password=?;";
        let todo = [req.body.country, req.body.pass];
        conn.query(laquery, todo, (err, rows, fields) => {
            if (err) {
                console.error(err);
                console.log('error en la consulta: ' + laquery + ' ' + todo);
            }
            //length==0 significa no hubo resultados, no hay link o paso el tiempo. En este caso es que no se duplicará
            if (rows.length == 0) {
                return res.json([{ 'error': false, 'verificado': false }]);
            } else {
                return res.json([{ 'error': false, 'verificado': true }]);
            }
        });
    }
});

app.get('/vabmresidente', function(req, res, next) {
    console.log('recibio ABM residente');
    fs.readFile("vigilanciaabmresid.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/abmresidentelista', function(req, res) {
    var country = req.body.country;
    var laquery = 'select  JSON_ARRAYAGG(JSON_OBJECT("id",id,"lote", lote, "nombre", nombre,"password", password, "sms", sms,"fecha_modif",DATE_FORMAT(fecha_modif, "%d/%m/%Y %H:%ihs"))) as resultado from persona WHERE `country` = ' + country + ';';
    conn.query(laquery, function(err, rows) {
        if (err) console.error(err);
        var html_string = rows[0].resultado;
        html_string = '{"data": ' + html_string + '}';
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/abmresidentealta', function(req, res) {
    console.log("Alta de residente");
    var lote = req.body.lote;
    var nombre = req.body.nombre;
    var sms = req.body.sms;
    var password = req.body.password;
    var country = req.body.country;
    if (password == '') password = 123456;
    if (nombre == '' && lote == '') {
        return res.json([{ 'hecho': 0 }]);
    } else {
        var laquery = "INSERT INTO persona (`country`,`lote`,`nombre`,`password`,`SMS`) VALUES (" + country + ",'" + lote + "','" + nombre + "','" + password + "','" + sms + "');";
        conn.query(laquery, function(err, rows) {
            if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
        });
    }
});

app.post('/abmresidentemodif', function(req, res) {
    console.log("MODIFICACION de residente");
    var id = req.body.id;
    var lote = req.body.lote;
    var nombre = req.body.nombre;
    var sms = req.body.sms;
    var password = req.body.password;
    var country = req.body.country;
    if (password == '') password = passworddefault;
    if (nombre == '' && lote == '') {
        return res.json([{ 'hecho': 0 }]);
    } else {
        var laquery = "UPDATE `persona` SET `lote` = '" + lote + "',`nombre` = '" + nombre + "',`password` = '" + password + "',`fecha_modif` = sysdate(),`SMS` = '" + sms + "' WHERE `id` = " + id + ";";
        conn.query(laquery, function(err, rows) {
            if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
        });
    }
});

app.post('/abmresidentebaja', function(req, res) {
    console.log("BAJA de residente");
    var borrar = req.body.borrar;
    var country = req.body.country;
    if (borrar == '') {
        return res.json([{ 'hecho': 0 }]);
    } else {
        var laquery = "DELETE FROM `persona` WHERE id=" + borrar + " and country=" + country + ";";
        conn.query(laquery, function(err, rows) {
            if (err) { return res.json([{ 'hecho': 0 }]); } else { return res.json([{ 'hecho': 1 }]); }
        });
    }
});

app.get('/BKPvchequea', function(req, res, next) {
    console.log('recibió vigilancia chequear');
    fs.readFile("vigilanciachequear.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/BKPvigilanciapendientes', function(req, res) {
    var country = req.body.country;
    let laquery = "SELECT i.visita,DATE_FORMAT(i.fecha_alta,'%d/%m') AS  fecha_alta,upper(i.nombre_teo) as nombre_teo,upper(i.apellido_teo) as apellido_teo,i.dia,p.lote,p.nombre as residente ,upper(v.nombre) as nombre,upper(v.apellido) as apellido,v.verif_residente,v.QR FROM invitacion i join persona p on i.residente=p.id join visita v on i.visita =v.id where v.enviodocumentacion=1 and v.verif_vigilancia=0 and i.visita <> 0 and p.country= " + country + ";";

    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
            return res.json({ 'error': true, 'message': 'Error occurred' + err });
        }
        //console.log(rows);
        res.json(rows);
    });
});

app.post('/vigilanciapendienteverificado', function(req, res) {
    let verificado = req.body.verificado;
    let laquery = "call visitaaceptada(?);";
    let todo = [verificado];

    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            verifVigilanciaBadge();
            vigilanciachequear();
            vigilanciavisitafutura();
            return res.json({ 'error': false });
        }
    });
});

app.post('/vigilanciapendienterechazado', function(req, res) {
    console.log("recibio vigilanciapendienterechazado");
    let rechazado = req.body.rechazado;
    let laquery = "call visitarechazada(?);";
    let todo = [rechazado];
    conn.query(laquery, todo, (err, rows) => {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            verifVigilanciaBadge();
            vigilanciachequear();
            enviarSms(1); //harcodeado el grupo
            return res.json({ 'error': false });
        }
    });
});

app.get('/BKPvigilanciavisitafutura', function(req, res, next) {
    console.log('recibió vigilanciavisitafutura');
    fs.readFile("vigilanciavisitafutura.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/BKPvigilanciavisitafutura', function(req, res) {
    var country = req.body.country;
    let laquery = "CALL vigilanciavisitafutura (" + country + ");";
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
            return res.json({ 'error': true, 'message': 'Error occurred' + err });
        }
        //console.log(rows[0]);
        res.json(rows[0]);
    });
});

app.post('/vigilanciaingreso', function(req, res) {
    let ingreso = req.body.ingreso;
    let country = req.body.country;
    let laquery = "call vigilanciaingreso(?,?);";
    let todo = [ingreso, country];

    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            return res.json(rows[0]);
        }
    });
});

app.post('/vigilanciavisitasale', function(req, res) {
    let salir = req.body.salir;
    let country = req.body.country;
    let laquery = "call vigilanciavisitasale(?,?);";
    let todo = [salir, country];

    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            return res.json({ 'error': false });
            vigilanciavisitapasada();
        }
    });
});


app.get('/residente', function(req, res, next) {
    console.log('recibio /residente via GET');
    fs.readFile("residente.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.post('/residenteverificar', function(req, res, next) {
    console.log('recibio /residenteverificar via POST');
    var nombre = req.body.nombre
    var password = req.body.password;
    var countryy = req.body.country;
    //console.log (nombre);
    //console.log (password + '<-');
    //console.log (countryy);
    //si no envió el nombre ya da { 'existe': 0 }
    //si     envió el nombre y no existe da { 'existe': 0 }
    //si indico el nombre pero no el password devolvera si existe o no
    //si indico el nombre y pass,  puede devolver que existe el nombre (porque antes hubieramos devuelto si no existe)
    if (nombre.length < 2) {
        //console.log('fin');
        return res.json({ 'error': false, 'existe': 0 });
    } else {
        nombre = nombre.trim();
        let laquery;
        if (countryy == 0) {
            laquery = "SELECT upper(p.password) as password,p.country,p.id,p.lote,c.nombre as countryname  FROM persona  p join country c on p.country=c.id where p.nombre=?;";
        } else {
            laquery = "SELECT upper(p.password) as password,p.country,p.id,p.lote,c.nombre as countryname  FROM persona  p join country c on p.country=c.id where p.nombre=? and p.country=?;";
        }
        let todo = [nombre, countryy];
        //console.log (laquery);

        conn.query(laquery, todo, (err, rows, fields) => {
            //console.log("query cant registros: " + rows.length);
            if (err) {
                console.log('no se conecto a la base de datos aldaba');
                console.log('error en la consulta: ' + laquery + ' ' + todo);
                return res.json({ 'error': true, 'message': 'ocurrio un error con la consulta la tabla personas ' + err });
            }
            if (rows.length == 0) {
                //length=0 significa no hubo resultados
                // si no hay resultado en la consulta SELECT  FROM personas where nombre=? es porque el nombre esta mal
                //fin del asunto
                //console.log('fin del asunto');
                return res.json({ 'error': false, 'existe': 0 });
            } else {
                if (password == undefined) {
                    return res.json({ 'error': false, 'existe': 1 });
                } else {
                    var country = 0;
                    password = password.trim();
                    for (var caso of rows) {
                        if (caso.password == password) {
                            country = caso.country;
                            return res.json({ 'error': false, 'equivocado': 0, 'existe': 1, 'country': country, 'id': caso.id, 'lote': caso.lote, 'countryname': caso.countryname });
                        }
                    }
                    if (country == 0) {
                        // si country sigue siendo cero es que no encontró a nadie con ese usuario y password
                        return res.json({ 'error': false, 'equivocado': 1, 'existe': 1 });
                    }
                }
            }
        })
    }
});

app.post('/BKPresidverificavisita', function(req, res) {
    let residente = req.body.residente;
    let laquery = "select id,nombre,apellido,verif_vigilancia from visita where residente=22 and verif_residente=0 and enviodocumentacion=1;";
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
            return res.json({ 'error': true, 'message': 'Error occurred' + err });
        }
        //console.log(rows);
        res.json(rows);
    });
});

app.post('/residentependienteverificado', function(req, res) {
    let verificado = req.body.verificado;
    let laquery = "update visita set verif_residente=1, verif_residente_cuando=sysdate()  where id= ?;";
    let todo = [verificado];

    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            return res.json({ 'error': false });
            residenteEnviaStats(req.body.residente);
            residenteEnviaStatsTexto(req.body.residente);
            residenteEnviaParaVerificar(req.body.residente);
        }
    });
});

app.post('/residentependientenoloconoce', function(req, res) {
    console.log("recibio --> residente pendiente NO lo conoce <--")
    let verificado = req.body.verificado;
    let laquery = "delete from visita where id= ?;";
    let todo = [verificado];

    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            return res.json({ 'error': false });
            residenteEnviaStats(req.body.residente);
            residenteEnviaStatsTexto(req.body.residente);
            residenteEnviaParaVerificar(req.body.residente);
        }
    });
});

app.post('/BKPresidfuturavisita', function(req, res) {
    console.log("recibio residfuturavisita");
    let residente = req.body.residente;
    let laquery = "call residentevisitafutura(?,1,@cuantos);";
    let todo = [residente];
    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
        }
        //console.log(rows);
        res.json(rows[0]);
    });
});

app.post('/BKPresidpasadavisita', function(req, res) {
    console.log(' post /residpasadavisita');
    let residente = req.body.residente;
    let laquery = "call residentevisitapasada(?);";
    let todo = [residente];
    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
        }
        console.log(rows);
        res.json(rows[0]);
    });
});

app.post('/residentecancelavisita', function(req, res) {
    console.log("---------------------------------- Programar esto ---------------------------");

    return res.json({ 'error': true, 'message': 'Error occurred' + err });
});

app.post('/invitacioncrea', function(req, res) {
    console.log("Crea una invitacion");
    var residente = req.body.idPersona;
    var nombre = req.body.nombre;
    var apellido = req.body.apellido;
    var sms = req.body.sms;
    //var mensaje = req.body.mensaje;
    var dia = req.body.dia;
    var hora = req.body.hora;
    var min = req.body.min;
    var duracion = req.body.duracion;
    let lunes, martes, miercoles, jueves, viernes, sabado, domingo, siempre;
    lunes = req.body.lunes;
    martes = req.body.martes;
    miercoles = req.body.miercoles;
    jueves = req.body.jueves;
    viernes = req.body.viernes;
    sabado = req.body.sabado;
    domingo = req.body.domingo;
    siempre = req.body.siempre;

    let laquery = "call crearinvitacion(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
    //let todo = [persona,null,numero,nombre,apellido,null,null,desde,hasta,desdeHs,hastaHs,null,null,null,null,null,null,null,null,null];
    let todo = [residente, nombre, apellido, sms, dia, hora, min, duracion, lunes, martes, miercoles, jueves, viernes, sabado, domingo, siempre];

    conn.query(laquery, todo, (err, rows, fields) => {

        if (err) {
            console.log(err);
            console.log('error en la consulta: ' + laquery + ' ' + todo);
            return res.json({ 'error': true });
        } else {
            residenteEnviaStats(residente);
            residenteEnviaStatsTexto(residente);
            enviarSms(1); ///aqui esta harcodeado el grupo de SMS
            return res.json({ 'error': false });
        }



    });
});

app.get('/visita', function(req, res, next) {
    console.log('recibio /visita');
    fs.readFile("visitasinlink.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get("/visita/:carpeta", function(req, res, next) {
    console.log("express recibio /visita/" + req.params.carpeta);
    var link = req.params.carpeta;
    //res.send('<iframe src="http://localhost:3001/"></iframe>')
    let laquery = "select v.id,v.paseLibre,v.desdeDia,v.hastaDia,v.desdeHora,v.hastaHora,v.lunes,v.martes,v.miercoles,v.jueves,v.viernes,v.sabado,v.domingo,v.aunAusente,v.nombre,v.apellido,v.empresa,v.dadaDeBaja,v.zonaPermitida,sitio.nombre as sitio from sms join visitas v on sms.idVisita=v.id join sitio on sms.sitio=sitio.id where fecha_env >  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL -24 HOUR) and link=?;";
    laquery = "SELECT i.nombre_teo,i.apellido_teo,v.id,c.nombre FROM sms s join visita v on s.idvisita=v.id join invitacion i on i.visita=s.idvisita join country c on v.country=c.id where s.link=?;";
    let todo = link;
    //console.log(laquery);
    //console.log(todo);
    conn.query(laquery, todo, (err, rows, fields) => {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
        }

        //length=0 significa no hubo resultados, no hay link o paso el tiempo
        //console.log(rows.length);
        if (rows.length) {
            fs.readFile("visita.html", function(err, html) {
                if (err) console.error(err);
                var html_string = html.toString();
                html_string = html_string.replace("xyzopqnombre", rows[0].nombre_teo);
                html_string = html_string.replace("xyzopqapellido", rows[0].apellido_teo);
                html_string = html_string.replace("xyzopqcountry", rows[0].nombre);
                html_string = html_string.replace("xyzopqid", rows[0].id);

                res.writeHead(200);
                res.write(html_string);
                res.end();
            });
        } else {
            fs.readFile("visitasinlink.html", function(err, html) {
                if (err) console.error(err);
                var html_string = html.toString();
                res.writeHead(200);
                res.write(html_string);
                res.end();
            });
        }

    });
});

app.post('/visita/fotoupload', function(req, res, next) {
    console.log('recibio /visita/fotoupload via POST');
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.json({ 'error': true });
        } else {
            if (files.f_rostro.size > 0) {
                var oldpath = files.f_rostro.path;
                var newpath = '../uploaded/' + fields.idvisita + '_FACE.png'; // + files.f_rostro.name.substr(files.f_rostro.name.length - 4);
                //console.log(oldpath);
                //console.log(newpath);
                //fs.rename(oldpath, newpath, function(err) { if (err) throw err; });


                sharp(oldpath).resize({ height: 480, width: 640 }).toFile(newpath)
                    .then(function(newFileInfo) {
                        console.log("El tamaño de foto fué reducido");
                    })
                    .catch(function(err) {
                        console.log("Got Error");
                    });

            }
            if (files.f_dni.size > 0) {
                var oldpath = files.f_dni.path;
                var newpath = '../uploaded/' + fields.idvisita + '_DNI.png'; // + files.f_dni.name.substr(files.f_dni.name.length - 4);
                //fs.rename(oldpath, newpath, function(err) { if (err) throw err; });
                sharp(oldpath).resize({ height: 480, width: 640 }).toFile(newpath)
                    .then(function(newFileInfo) {
                        console.log("el tamaño de foto fué reducido");
                    })
                    .catch(function(err) {
                        console.log("Got Error");
                    });


            }

            var fotodni = fields.ff_dni;
            if (fotodni !== undefined && fotodni != null) {
                if (fotodni.length > 1000) {
                    fotodni = fotodni.replace(/^data:image\/\w+;base64,/, "");
                    fotodni = Buffer.from(fotodni, 'base64');
                    fs.writeFile('../uploaded/' + fields.idvisita + '_DNI.png', fotodni, function(err) {
                        if (err) throw err;
                        //console.log("The file was saved!");
                    });
                }
            }
            var fotorostro = fields.ff_rostro;
            if (fotorostro != undefined && fotorostro != null) {
                if (fotorostro.length > 1000) {
                    fotorostro = fotorostro.replace(/^data:image\/\w+;base64,/, "");
                    fotorostro = Buffer.from(fotorostro, 'base64');
                    fs.writeFile('../uploaded/' + fields.idvisita + '_FACE.png', fotorostro, function(err) {
                        if (err) throw err;
                        //console.log("The file was saved!");
                    });
                }
            }
            let laquery = "call crearvisita (?,?,?);";
            let todo = [fields.nombre, fields.apellido, fields.idvisita];
            conn.query(laquery, todo, (err, rows, fields) => {
                if (err) {
                    return console.error(err.message);
                } else {
                    for (var caso of rows[0]) {
                        if (caso.nueva == 0) {
                            console.log('Reemplaza foto existente');
                            //está actualizando una foto ya existente,tengo que decirle a la ventana de verificar, que está en vigilancia, que recargue la foto
                            fuerzanuevo = fuerzanuevo + 1;
                        }

                    }
                    verifVigilanciaBadge();
                    vigilanciachequear();
                    residenteEnviaStats(caso.residente);
                    residenteEnviaStatsTexto(caso.residente);
                    residenteEnviaParaVerificar(caso.residente);
                }
            });

        }

        //console.log( files);
        //console.log(files.f_rostro.size,files.f_rostro.name);
        //console.log(files.f_dni.size,files.f_dni.name);
        //console.log(fields.ff_rostro.length,'-->',fields.ff_rostro,'<--');


        //res.json({ fields, files });
        //res.end();
        return res.json({ 'error': false });
    });
});

app.post('/SMS', function(req, res, next) {
    console.log('recibio /SMS via POST');
    var accion = req.body.accion;
    var grupo = req.body.grupo;
    grupo = 1;
    if (accion == "pedir") {
        var laquery = 'select id,telefono,msg from sms where fecha_env is null and grupo=' + grupo + ' order by fecha_alta asc limit 1';
        conn.query(laquery, function(err, rows) {
            if (err) {
                console.log('no se conecto a la base de datos');
                console.log('error en la consulta: ' + laquery);
                return res.json({ 'error': true, 'message': 'Error occurred' + err });
            }
            //connection will be released as well.
            //console.log(rows);
            res.json(rows);
        });
    }
    if (accion == "enviado") {
        var cual = req.body.cual;
        var laquery = 'update sms set fecha_env=CURRENT_TIMESTAMP where id=' + cual;
        conn.query(laquery);
    }
});

app.get('/webcam', function(req, res, next) {
    console.log('recibio /webcam');
    fs.readFile("webcam.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});
//////////////////////////////////////////////////////
app.post('/visita/fotoupload2', function(req, res, next) {
    console.log('recibio /visita/fotoupload via POST');

    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        console.log(fields.nombre, fields.apellido, fields.idvisita);
        //console.log( fields);
        console.log(files);
        console.log(fields.ff_rostro);
        console.log(fields.ff_dni);



        return res.json({ 'error': false });
    });
});



app.get("/visita3/:carpeta", function(req, res, next) {
    console.log("express recibio /visita/" + req.params.carpeta);
    var link = req.params.carpeta;
    //res.send('<iframe src="http://localhost:3001/"></iframe>')
    let laquery = "select v.id,v.paseLibre,v.desdeDia,v.hastaDia,v.desdeHora,v.hastaHora,v.lunes,v.martes,v.miercoles,v.jueves,v.viernes,v.sabado,v.domingo,v.aunAusente,v.nombre,v.apellido,v.empresa,v.dadaDeBaja,v.zonaPermitida,sitio.nombre as sitio from sms join visitas v on sms.idVisita=v.id join sitio on sms.sitio=sitio.id where fecha_env >  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL -24 HOUR) and link=?;";
    laquery = "SELECT i.nombre_teo,i.apellido_teo,v.id,c.nombre FROM sms s join visita v on s.idvisita=v.id join invitacion i on i.id=s.idvisita join country c on v.country=c.id where s.link=?;";
    let todo = link;
    //console.log(laquery);
    //console.log(todo);
    conn.query(laquery, todo, (err, rows, fields) => {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
        }

        //length=0 significa no hubo resultados, no hay link o paso el tiempo
        //console.log(rows.length);
        if (rows.length) {
            fs.readFile("visita3.html", function(err, html) {
                if (err) console.error(err);
                var html_string = html.toString();
                html_string = html_string.replace("xyzopqnombre", rows[0].nombre_teo);
                html_string = html_string.replace("xyzopqapellido", rows[0].apellido_teo);
                html_string = html_string.replace("xyzopqcountry", rows[0].nombre);
                html_string = html_string.replace("xyzopqid", rows[0].id);

                res.writeHead(200);
                res.write(html_string);
                res.end();
            });
        } else {
            fs.readFile("visitasinlink.html", function(err, html) {
                if (err) console.error(err);
                var html_string = html.toString();
                res.writeHead(200);
                res.write(html_string);
                res.end();
            });
        }

    });
});

app.get('/vigilancia2', function(req, res, next) {
    console.log('recibio /vigilancia');
    fs.readFile("vigilancia2.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/vigilancia3', function(req, res, next) {
    console.log('recibio /vigilancia');
    fs.readFile("vigilancia3.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});
app.get("/visita2/:carpeta", function(req, res, next) {
    console.log("express recibio /visita/" + req.params.carpeta);
    var link = req.params.carpeta;
    //res.send('<iframe src="http://localhost:3001/"></iframe>')
    let laquery = "select v.id,v.paseLibre,v.desdeDia,v.hastaDia,v.desdeHora,v.hastaHora,v.lunes,v.martes,v.miercoles,v.jueves,v.viernes,v.sabado,v.domingo,v.aunAusente,v.nombre,v.apellido,v.empresa,v.dadaDeBaja,v.zonaPermitida,sitio.nombre as sitio from sms join visitas v on sms.idVisita=v.id join sitio on sms.sitio=sitio.id where fecha_env >  DATE_ADD(CURRENT_TIMESTAMP, INTERVAL -24 HOUR) and link=?;";
    laquery = "select v.id, i.nombre_teo,v.country from sms join visita v on sms.idVisita=v.id join invitacion i on sms.idVisita=i.visita where link=?;";
    let todo = link;
    //console.log(laquery);
    //console.log(todo);
    conn.query(laquery, todo, (err, rows, fields) => {
        if (err) {
            console.log('error en la consulta: ' + laquery + ' ' + todo);
        }

        //length=0 significa no hubo resultados, no hay link o paso el tiempo
        //console.log(rows.length);
        if (rows.length) {
            fs.readFile("visita2.html", function(err, html) {
                if (err) console.error(err);
                var html_string = html.toString();
                html_string = html_string.replace("xyzopqnombre", rows[0].nombre);
                html_string = html_string.replace("xyzopqcountry", rows[0].country);
                html_string = html_string.replace("xyzopqid", rows[0].id);

                res.writeHead(200);
                res.write(html_string);
                res.end();
            });
        } else {
            fs.readFile("visitasinlink.html", function(err, html) {
                if (err) console.error(err);
                var html_string = html.toString();
                res.writeHead(200);
                res.write(html_string);
                res.end();
            });
        }

    });
});

app.get('/ejemplo.html', function(req, res, next) {
    console.log("ejemplo");
    fs.readFile("ejemplo.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/ejemplo2.html', function(req, res, next) {
    console.log("ejemplo2");
    fs.readFile("ejemplo2.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/ejemplo3.html', function(req, res, next) {
    console.log("ejemplo3");
    verifVigilanciaBadge();
    fs.readFile("ejemplo3.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});

app.get('/ejemplo4.html', function(req, res, next) {
    console.log("ejemplo4");
    fs.readFile("ejemplo4.html", function(err, html) {
        if (err) console.error(err);
        var html_string = html.toString();
        res.writeHead(200);
        res.write(html_string);
        res.end();
    });
});




//app.listen(3000, function() {    console.log('HTTP web server escuchando en el puerto 3000');  });
//https.createServer(options, app).listen('3000', function() { console.log('Servidor HTTPS escuchando en el puerto 3000'); });

var server = https.createServer(options, app);
server.listen('3000', function() {
    console.log('Servidor HTTPS escuchando en el puerto 3000');
});
var io = require('socket.io').listen(server);
//require('./camaraIOController')(io);

let onlineIOconn = new Set();
let arrayauxiliar = new Array();
let onlineVigilancia = new Map();
let onlineResidente = new Map();
let onlineServerSMS = new Map();
let webcams = {};
var deviceConfig = {
    video: {
        width: 320,
        spectRatio: 1.33,
        facingMode: "environment"
    },
    audio: false

};
//width: { min: 640, ideal: 1920, max: 1920 },
//height: { min: 400, ideal: 1080 },
//aspectRatio: 1.777777778,
//frameRate: { max: 30 },
//facingMode: { exact: "user" }
let muestraChequeoServerFuturo = false;
/////////////////  tengo que ver como quitarlos de este set cuando se desconectan
function chequeoServer() {
    muestraChequeoServerFuturo = false;
    let cuantaswebcams = 0;
    for (let id in webcams) {
        ++cuantaswebcams;
        //console.log(id);
    }
    cuantaswebcams = cuantaswebcams - onlineVigilancia.size;

    console.log("┌" + "─".repeat(13) + "┬" + "─".repeat(24) + "┐");
    arrayauxiliar = Array.from([...new Set(onlineVigilancia.values())]); //los datos del map los ponfo en un set para evitar duplicados y luego en un array para poder luego ordenarlos y separarlos por coma
    arrayauxiliar.sort();
    console.log("│ Vigilancia  │ " + arrayauxiliar.join(','), " ".repeat(22 - (arrayauxiliar.join(',').length)) + "│");
    console.log("├" + "─".repeat(13) + "┼" + "─".repeat(24) + "┤");
    console.log("│ Webcams     │ cantidad: " + cuantaswebcams.toString(), " ".repeat(11) + "│");
    console.log("├" + "─".repeat(13) + "┼" + "─".repeat(24) + "┤");
    arrayauxiliar = Array.from([...new Set(onlineResidente.values())]); //los datos del map los ponfo en un set para evitar duplicados y luego en un array para poder luego ordenarlos y separarlos por coma
    arrayauxiliar.sort();
    console.log("│ Residente   │ " + arrayauxiliar.join(','), " ".repeat(22 - (arrayauxiliar.join(',').length)) + "│");
    console.log("├" + "─".repeat(13) + "┼" + "─".repeat(24) + "┤");
    arrayauxiliar = Array.from([...new Set(onlineServerSMS.values())]); //los datos del map los ponfo en un set para evitar duplicados y luego en un array para poder luego ordenarlos y separarlos por coma
    arrayauxiliar.sort();
    console.log("│ SMSserver   │ " + arrayauxiliar.join(','), " ".repeat(22 - (arrayauxiliar.join(',').length)) + "│");
    console.log("└" + "─".repeat(13) + "┴" + "─".repeat(24) + "┘");


    if (onlineIOconn.size != onlineVigilancia.size + onlineResidente.size + onlineServerSMS.size + cuantaswebcams) {
        console.log("");
        console.log("????????????????????????????????????????");
        console.log("Está mal la cantidad de conexiones");
        console.log("conexiones: " + onlineIOconn.size);
        console.log("Vigilancia: " + onlineVigilancia.size);
        console.log("Webcams: " + cuantaswebcams);
        console.log("Residente: " + onlineResidente.size);
        console.log("SMSserver: " + onlineServerSMS.size);
        console.log("????????????????????????????????????????");
        console.log("");
    }
}

io.on('connection', function(socket) {
    onlineIOconn.add(socket.id);
    //console.log("cantidad de conexiones: " + onlineIOconn.size);
    // Use socket to communicate with this particular client only, sending it it's own id
    socket.emit('welcome', { message: 'Conectado con el servidor Aldaba', id: socket.id });

    socket.on('i am client', function(data) {
        //console.log(data);
        if (data.app == 'vigilancia') {
            socket.join('country' + data.country);
            onlineVigilancia.set(socket.id, data.country);
            //console.log('vigilancia', data.country);
            vigilanciachequear();
            vigilanciavisitapasada();
            vigilanciavisitafutura();
            vigilanciavisitaadentro();
            verifVigilanciaBadge(data.country);
            vigilanciaSmsServerBadge();
            if (!muestraChequeoServerFuturo) {
                setTimeout(chequeoServer, 1000);
                muestraChequeoServerFuturo = true;
            }
            // Va a fijarse cuales webcams estan conectadas ahora, y a cada una le manda pedido de hacer WebRTC
            for (let id in webcams) {
                socket.broadcast.to(id).emit('arrancarWebcam', socket.id, deviceConfig);
                console.log('arrancarWebcam', id);
            }
        }
        if (data.app == 'residente') {
            onlineResidente.set(socket.id, data.id);
            socket.join('residente' + data.id);
            //console.log("Se conectó el residente:", data.id);
            residenteEnviaStats(data.id);
            residenteEnviaStatsTexto(data.id);
            residenteEnviaFuturas(data.id);
            residenteEnviaPasadas(data.id);
            residenteEnviaParaVerificar(data.id);
            if (!muestraChequeoServerFuturo) {
                setTimeout(chequeoServer, 1000);
                muestraChequeoServerFuturo = true;
            }
        }
        if (data.app == 'SMS') {
            //console.log("Se conectó un telefono que manda SMS para el grupo: ", data.grupo);
            socket.join('SMS' + data.grupo);
            onlineServerSMS.set(socket.id, data.grupo);
            enviarSms(data.grupo);
            vigilanciaSmsServerBadge();
            if (!muestraChequeoServerFuturo) {
                setTimeout(chequeoServer, 1000);
                muestraChequeoServerFuturo = true;
            }
        }
        if (data.app == 'webcam') {
            console.log("Se conectó una webcam: ");
            webcams[socket.id] = socket
            // se fija cuales sockets de vigilanca estan conectados y hace como que cada uno está pidiendo que la webcam se conecte
            for (let vigilancia of onlineVigilancia.keys()) {
                setTimeout(function() {
                    if (webcams[socket.id]) {
                        webcams[socket.id].emit('arrancarWebcam', vigilancia, deviceConfig);
                        console.log('para ', socket.id, '    desde ', vigilancia);
                    }
                }, 2000)
                console.log('que Vigilancia pida conectarse a Webcams');
            }
            if (!muestraChequeoServerFuturo) {
                setTimeout(chequeoServer, 1000);
                muestraChequeoServerFuturo = true;
            }
        }
    });

    socket.on("disconnect", () => {
        onlineIOconn.delete(socket.id);
        if (onlineVigilancia.has(socket.id)) {
            onlineVigilancia.delete(socket.id);
            //avisar a 
            desconexionVigilancia(socket.id);
        }
        onlineResidente.delete(socket.id);
        onlineServerSMS.delete(socket.id);
        for (let id in webcams) {
            if (id === socket.id) {
                delete webcams[socket.id]
                desconexionWebcams(socket.id);
            }
        }

        if (!muestraChequeoServerFuturo) {
            setTimeout(chequeoServer, 1000);
            muestraChequeoServerFuturo = true;
        }
        //console.log("cantidad de conexiones: " + onlineIOconn.size);
        //console.info(`Socket ${socket.id} has disconnected.`);
        vigilanciaSmsServerBadge();
    });

    socket.on("meDesconecto", () => {
        console.log("se Desconecta");
        if (onlineVigilancia.has(socket.id)) {
            onlineVigilancia.delete(socket.id);
            //avisar a 
            desconexionVigilancia(socket.id);
        }
        for (let id in webcams) {
            if (id === socket.id) {
                delete webcams[socket.id]
                // avisar
                desconexionWebcams(socket.id);
            }
        }
    });

    socket.on("SMSenviado", (data) => {
        //console.log("SMSenviado ",data.app);
        //console.log("SMSenviado ",data.grupo);
        //console.log("SMSenviado " ,data.id);
        if (data.app == 'SMS') {
            var laquery = 'update sms set fecha_env=CURRENT_TIMESTAMP where id=' + data.id + ' and grupo=' + data.grupo;
            conn.query(laquery);
            laquery = 'select persona from sms where id=' + data.id + ' and grupo=' + data.grupo;
            conn.query(laquery, (err, rows, fields) => {
                if (err) {
                    console.log('error en la consulta: ' + laquery);
                } else {
                    residenteEnviaStats(rows[0].persona);
                    residenteEnviaStatsTexto(rows[0].persona);
                }
            });

        }
    });

    socket.on('webcamOferta', function(origen, destino, message) {
        console.log('webcamOferta ', message.type);
        socket.broadcast.to(destino).emit('webcamOferta', origen, message);
    });

    socket.on('vigilanciaAtiendeOferta', function(origen, destino, message) {
        //console.log('vigilanciaAtiendeOferta ', quien,message);
        //console.log('vigilanciaAtiendeOferta ', message.type);
        socket.broadcast.to(destino).emit('vigilanciaAtiendeOferta', origen, message);
    });

    socket.on("webcamCambiaResolucion", (paraQuien, configCamara) => {
        for (let id in webcams) {
            if (id === paraQuien) {
                webcams[paraQuien].emit('webcamCambiaResolucion', configCamara);
                console.log("que ", paraQuien, "cambie la resolucion a ", configCamara);
            }
        }
    });

    socket.on("configuraWebcam", (cual, que) => {
        console.log("configuraWebcam", cual, que);
        for (let id in webcams) {
            if (id === cual) {
                // avisar
                desconexionWebcams(cual);
                console.log("Se conectó una webcam: ", cual);
                // se fija cuales sockets de vigilanca estan conectados y hae como que cada uno está pidiendo que la webcam se conecte
                for (let vigilancia of onlineVigilancia.keys()) {
                    setTimeout(function() {

                        webcams[cual].emit('arrancarWebcam', vigilancia, que);
                        console.log('para ', cual, '    desde ', vigilancia);

                    }, 2000)
                    console.log('que Vigilancia pida conectarse a Webcams');
                }
            }
        }
    });

    function desconexionVigilancia(cual) {
        for (let id in webcams) {
            socket.broadcast.to(id).emit('seDesconecto', cual);
            console.log('aviso a Webcams que se desconectó Vigilancia');
        }
    }

    function desconexionWebcams(cual) {
        for (let id of onlineVigilancia.keys()) {
            socket.broadcast.to(id).emit('seDesconecto', cual);
            console.log('aviso a Vigilancia que se desconectó Webcams');
        }
    }

    socket.on("leyoQR", (qr) => {
        for (let cada of listacountryhabilitado) {
console.log("leyoQR ",qr,"CALL vigilanciavisitaqr (" + cada + ",'" + qr + "');");
        let laquery = "CALL vigilanciavisitaqr (" + cada + ",'" + qr + "');";
        conn.query(laquery, function(err, rows) {
            console.log(rows);
            if (rows != undefined) {
            for (var caso of rows[0]) {
                console.log(cada + ':' + caso);
                io.to('country' + cada).emit('tarjetaVisitaQrAgrega', caso);
                //io.emit('tarjetaVisitaAdentroAgrega', cada);
            }
            }
        })
    }
        
        
    });
    
});

function enviarSms(grupo) {
    if (grupo == undefined || grupo == null) { grupo = 1 }
    var laquery = 'select id,telefono,msg from sms where fecha_env is null and grupo=' + grupo + ' order by fecha_alta asc'; //limit 1
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log('no se conecto a la base de datos');
            console.log('error en la consulta: ' + laquery);
        }
        for (var caso of rows) {
            //aqui hay que ver como se discrimina que no haya dos telefonos para el mismo grupo, que no sean 2 telefonos los que envien el mismo sms a la ez
            io.to('SMS' + grupo).emit('enviar', caso);
            console.log(caso);
        }
    });
}
//setInterval(enviarSms, 120000);

function vigilanciaSmsServerBadge() {
    // aqui falta separar los grupos de celulares que enviaran SMSs, ahora solo está programado el grupo 1
    let grupo = 1;
    // hay que hacer una consulta sql con cuales countrys hay y a que grupo de sms pertenecen
    let countrysms = 2;
    io.to('country' + countrysms).emit('cantServerSMS', onlineServerSMS.size);
    //console.log('envio al country 2 la actidad de celulares servidores de SMS: ' + onlineServerSMS.size ); 
}

function residenteEnviaStats(cual) {
    /*
    // este codigo es para cuando no se indicaba cual residente, y cuando onlineresidente era set en vez de map
    for (let cada of onlineResidente) {
        //console.log('en lista: ' + cada);
        let laquery = "CALL residentestats (" + cada + ");";
        conn.query(laquery, function(err, rows) {
            //console.log(rows);
            for (var caso of rows[0]) {
                //console.log(cada + ':' + caso);
                io.to('residente' + cada).emit('estadisticas', caso);
                //io.emit('tarjetaVisitaAdentroAgrega', cada);
            }
        })
    }
    */
    let laquery = "CALL residentestats (" + cual + ");";
    conn.query(laquery, function(err, rows) {
        for (var caso of rows[0]) {
            // igual solo da 1 resultado, un solo row
            io.to('residente' + cual).emit('estadisticas', caso);
        }
    })
}

function residenteEnviaStatsTexto(cual) {
    let laquery = "CALL residentestatstexto (" + cual + ");";
    conn.query(laquery, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
        }
        io.to('residente' + cual).emit('estadisticasTexto', rows[0]);
    })
}

function residenteEnviaFuturas(residente) {
    // console.log("io  residenteEnvia Futuras");
    let laquery = "call residentevisitafutura(?,1,@cuantos);";
    let todo = [residente];
    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
        }
        //console.log(rows);
        io.to('residente' + residente).emit('futuras', rows[0]);
    });
}

function residenteEnviaPasadas(residente) {
    //console.log("io  residenteEnvia Pasadas");
    let laquery = "call residentevisitapasada(?);";
    let todo = [residente];
    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
        }
        //console.log(rows);
        io.to('residente' + residente).emit('pasadas', rows[0]);

    });
}

function residenteEnviaParaVerificar(residente) {
    //console.log("io  residenteEnvia para Verificar");
    let laquery = "select id,nombre,apellido,verif_vigilancia from visita where residente=? and verif_residente=0 and enviodocumentacion=1;";
    let todo = [residente];
    conn.query(laquery, todo, function(err, rows) {
        if (err) {
            console.log('error en la consulta: ' + laquery);
        }
        io.to('residente' + residente).emit('verificar', rows);
    });
}

function verifVigilanciaBadge(cualcountry) {
    //esta consulta deberia ser similar a la que muestra a vigilancia todo lo que tiene para verificar
    //en esta version no se le indica el country, envia a todos los que esten conectados

    // esta consulta trae todos los countrys que existen, y con cantidad cero si no tiene casos. Es liviana, mejor no resumirla, mejor no irla cambiando con filtrar cada vez por un country distincto, cosa de quede en cache del server SQL y sea aun mas rapida
    let laquery = `select country, sum(cantidad) as cantidad from (
        select distinct country,0 as cantidad from visita
        union all
        SELECT p.country,1 as cantidad FROM invitacion i join persona p on i.residente=p.id join visita v on i.visita =v.id 
        where v.enviodocumentacion=1 and v.verif_vigilancia=0 and i.visita <> 0
        ) as q group by country;`;
    conn.query(laquery, (err, rows, fields) => {
        if (err) { console.error(err); } else {
            // falta hacerle un for each country
            if (rows.length) {
                for (var caso of rows) {
                    if (cualcountry == undefined || cualcountry == null) {

                        io.to('country' + caso.country).emit('verifVigilanciaBadge', caso.cantidad);
                        console.log('envio al grupo country' + caso.country + ':   verifVigilanciaBadge=', caso.cantidad);
                    } else {
                        if (cualcountry == caso.country) {
                            io.to('country' + caso.country).emit('verifVigilanciaBadge', caso.cantidad);
                            console.log('envio específicamente al grupo country' + caso.country + ':   verifVigilanciaBadge=', caso.cantidad);
                        }
                    }

                }
            }
        }
    });
}
//setInterval(verifVigilanciaBadge, 10*60*1000);

function vigilanciavisitapasada() {
    for (let cada of listacountryhabilitado) {
        let laquery = "CALL vigilanciavisitapasada (" + cada + ");";
        conn.query(laquery, function(err, rows) {
            //for (var caso of rows[0]) {

            io.to('country' + cada).emit('listaVisitapasada', rows[0]);
            //io.emit('tarjetaVisitaAdentroAgrega', cada);

        })
    }
}
//setInterval(vigilanciavisitapasada, 10000);


function vigilanciavisitaadentro() {
    for (let cada of listacountryhabilitado) {
        let laquery = "CALL vigilanciavisitaadentro (" + cada + ");";
        conn.query(laquery, function(err, rows) {
            for (var caso of rows[0]) {
                //console.log(cada + ':' + caso);
                io.to('country' + cada).emit('tarjetaVisitaAdentroAgrega', caso);
                //io.emit('tarjetaVisitaAdentroAgrega', cada);
            }
        })
    }
}
//setTimeout(function() { setInterval(vigilanciavisitaadentro, 5000) }, 100);


function vigilanciavisitafutura() {
    for (let cada of listacountryhabilitado) {
        let laquery = "CALL vigilanciavisitafutura (" + cada + ");";
        conn.query(laquery, function(err, rows) {
            for (var caso of rows[0]) {
                //console.log(cada + ':' + caso);
                io.to('country' + cada).emit('tarjetaVisitaFuturaAgrega', caso);
                //io.emit('tarjetaVisitaAdentroAgrega', cada);
            }
        })
    }
}
//setTimeout(function() { setInterval(vigilanciavisitafutura, 5000) }, 1000);


function vigilanciachequear() {

    //console.log('fuerzanuevo', fuerzanuevo);
    for (let cada of listacountryhabilitado) {
        let laquery = `SELECT i.visita as "id",i.visita,DATE_FORMAT(i.fecha_alta,'%d/%m') as fecha_alta,
        upper(i.nombre_teo) as nombre_teo,upper(i.apellido_teo) as apellido_teo,i.dia,p.lote,p.nombre as residente,
        upper(v.nombre) as nombre,upper(v.apellido) as apellido,v.verif_residente,v.QR ,` + fuerzanuevo + ` as fuerzanuevo 
        FROM invitacion i join persona p on i.residente=p.id join visita v on i.visita=v.id 
        where v.enviodocumentacion=1 and v.verif_vigilancia=0 and i.visita <> 0 and p.country= ` + cada + ` 
        union all select 0,0,0,0,0,0,0,0,0,0,0,0,` + fuerzanuevo + ` from dual ;`;
        conn.query(laquery, function(err, rows) {
            for (var caso of rows) {
                //console.log(cada + ':' + caso);
                io.to('country' + cada).emit('tarjetaVigilanciaChequearAgrega', caso);
                //io.emit('tarjetaVisitaAdentroAgrega', cada);
            }
        })
    }
}
//setTimeout(function() { setInterval(vigilanciachequear, 5000) }, 2000);


/*
     // sending to sender-client only
     socket.emit('message', "this is a test");

     // sending to all clients, include sender
     io.emit('message', "this is a test");

     // sending to all clients except sender
     socket.broadcast.emit('message', "this is a test");

     // sending to all clients in 'game' room(channel) except sender
     socket.broadcast.to('game').emit('message', 'nice game');

     // sending to all clients in 'game' room(channel), include sender
     io.in('game').emit('message', 'cool game');

     // sending to sender client, only if they are in 'game' room(channel)
     socket.to('game').emit('message', 'enjoy the game');

     // sending to all clients in namespace 'myNamespace', include sender
     io.of('myNamespace').emit('message', 'gg');

     // sending to individual socketid
     socket.broadcast.to(socketid).emit('message', 'for your eyes only');
     io.sockets.socket(socketId).emit(msg);
     //or you can send it to a room
     socket.broadcast.to('chatroom').emit('message', 'this is the message to all');
    
     ///////
     //It proves that socket.io will process connect first then connection.
     https://stackoverflow.com/questions/26351919/whats-the-difference-on-connect-vs-on-connection
*/


/*
SET to Array
[...set];
[...set.keys()];
[...set.values()];
Array.from(set);
Array.from(set.keys());
Array.from(set.values());

*/