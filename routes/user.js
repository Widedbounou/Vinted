// on recupere Express
const express = require("express");
// on créer un routeur comme un sous serveur
const router = express.Router();

//On importe notre modele pour pouvoir le suivre
const User = require("../models/User");

//on require les pakcage pour proteger le mot de passé de l'utilisateur
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

//creation de la route en .POST . ici SANS USER car dans Index.js  on l'a filtré
router.post("/signup", async (req, res) => {
  try {
    // on utilise la methode descructuring
    const { username, email, password, newsletter } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "missing parameters" });
    }

    // verifier si l'email est deja pris  ?
    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(409).json({ message: "email already taken" });
    }

    //Appel des package pour encrypté le mdp
    const salt = uid2(64);
    const token = uid2(64);
    const hash = SHA256(password + salt).toString(encBase64);

    //creation de l'utilisateur
    const newUser = new User({
      email: email,
      account: {
        username: username,
      },
      newsletter: newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });
    await newUser.save();

    // on ne peut pas tout retourner car sinon on afficherait le hash salt et token
    return res.status(201).json({
      _id: newUser._id,
      token: newUser.token,
      account: newUser.account,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

//creation de la seconde route et ici avec la methode non destructuré
router.post("/login", async (req, res) => {
  try {
    //verifier l'utilisateur existe dans notre BDD
    const user = await User.findOne({ email: req.body.email });

    //securité si on trouve personne
    //faire le code toute seule Wided

    //on recupere le mot de passe de l'utilisatue ret va on le comparer
    const passwordToTest = SHA256(req.body.password + user.salt).toString(
      encBase64
    );
    if (passwordToTest === user.hash) {
      return res.status(200).json({
        _id: user._id,
        token: user.token,
        account: user.account,
      });
    } else {
      return res.status(400).json({ message: "email or password incorrect" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//On exporte ce package de route  pour pouvoir le lire dans index.js
module.exports = router;
