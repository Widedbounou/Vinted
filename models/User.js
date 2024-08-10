//on require Mongosse car on en a besoin
const mongoose = require("mongoose");

//creation de notre utilisateur const User est notre constructeur et ensuite le nom de la connection dans Mango
const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: Object,
  },
  newsletter: Boolean,
  token: String,
  hash: String,
  salt: String,
});

//exporter pour pouvoir utiliser dans les autre fichiers
module.exports = User;
