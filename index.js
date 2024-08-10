//import de Express & mongoose & Cloudinary
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2; // pour enregistrer les photos
Require("dotenv").config(); // import de dotenv
const cors = require("cors"); // import de cors pour proteger les les autres sites

//callback pour appeler express & cors fonction
const app = express();
app.use(cors());

//middleware to appeler mes body
app.use(express.json());

//se conencter en BDD  en local + creation
mongoose.connect(process.env.MONGODB_URI);

//Connection a Cloudinery, ici les identifiants sont les miens (Wided)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_APISECRET,
});

//import de mes routers (routes)
const userRouter = require("./routes/user");
const offerRouter = require("./routes/offer");

//Utilisation de mes routers. Ici on dit qu'on utilise cette route uniquement pour les users donc on gagne du temps dans les route a ne pas renseigner /user/signup
app.use("/user", userRouter);
//utilisation de ma route Offer
app.use(offerRouter);

//recuperer toute requete ne va pas au bon endroit en app.all
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

// Appel de mon port
app.listen(process.env.PORT, () => {
  console.log("Server started");
});
