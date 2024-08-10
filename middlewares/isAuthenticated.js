// Import du modele User car utilisation pour savoir si le client est dans BDD pour login ou non
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", ""); // la varia Token permet de supprimer le Bearer  affiché apres le token pour comparer ensuite
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // par convention user existe donc ici
    //on stocke dans une nouvelle requete l'user qui s'est bien identifié pour opti code dans les autres routes
    req.user = user;
    return next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
