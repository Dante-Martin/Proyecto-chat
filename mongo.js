const mongoose = require("mongoose");
const UseryUsermsg = mongoose.Schema;
mongoose.set("strictQuery", true);
const mySchema2 = new UseryUsermsg(
    {
        todo: String
    },
    { timestamps: true }
);



/*-----MODEL-----*/
//Para utilizar el squema se usa model para normalizarlo

const modeloBD = mongoose.model("recopilado", mySchema2);// nombre del modelo y a que esquema pertenece
module.exports = modeloBD;
