//Modelo de nuestra base de datos

const mongoose = require("mongoose");

mongoose.set("strictQuery", true); //Cuando strictla opción se establece en true , Mongoose se asegurará de que solo los campos que se especifican en su esquema se guarden en la base de datos, y todos los demás campos no se guardarán (si se envían otros campos).

const Schema = mongoose.Schema;


const mySchema = new Schema(
  {
    user: String,
    message: { type: String, require: true }, // el objeto mensaje es un string y que siempre sera requerido
    date: Date,
    // id: Number,
  },
  { timestamps: true }
);

const model = mongoose.model("mensaje", mySchema); // Todo lo que se cree tiene este esquema y se guarda en la base de datos con el nombre Mensaje

module.exports = model;


