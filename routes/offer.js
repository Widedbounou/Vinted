const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload"); // require pour uploader les photos
const cloudinary = require("cloudinary").v2; // pour enregistrer les photos
const isAuthenticated = require("../middlewares/isAuthenticated"); // import du middleware Authenticated

// import de mes models
const Offer = require("../models/Offer");
const User = require("../models/User");

//fonction formatage image convertir un buffer en base64 pour que cloudinary puisse lire l'image
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

// Publier une offre
router.post(
  "/offer/publish",
  fileUpload(),
  isAuthenticated,
  async (req, res) => {
    try {
      ///-------------------- MIDDLEWARE  isAuthenticated est appeleret envoie next pour pub lier

      // methode descructuring de req(requete client)
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      //verifier que tous lec hamps sont remplis par le client. ex si il ma nque le prix, afficher

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: Object,
        owner: req.user._id, // utilisattion de la req req.user qu'on a trouvé dans le middleware
      });

      const result = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture)
      );
      // console.log(result);

      // j'ajoute les infos de mon image stocké dans Cloudinary dans newOffer
      newOffer.product_image = result;

      // console.log(newOffer);
      await newOffer.save();

      // répondre  au client
      const responseObj = {
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        product_image: result,
        owner: {
          account: req.user.account,
          _id: req.user._id,
        },
      };
      // console.log(responseObj);

      return res.status(201).json(responseObj);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Recherche une offre
router.get("/offers", async (req, res) => {
  try {
    // console.log("/offers");

    // les filtres du find :
    const filters = {};

    // si j'ai un titre :  .find({ product_name : regex })
    // si j'ai un price min :  .find({ product_price : { $gte : priceMin } })
    // si j'ai price MIN ET price MAX :  .find({ product_price : { $gte : priceMin, $lte : priceMax } })
    // si j'ai un titre et une ou pls limites : .find({ product_name : regex , product_price : { $gte : priceMin } })

    // MAIS COMMENT FAIRE ?

    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");

      if (req.query.priceMin) {
        filters.product_price = { $gte: Number(req.query.priceMin) }; // { product_price : { $gte : priceMin } }
      }

      if (req.query.priceMax) {
        // est ce que l'objet product price existe ?
        if (filters.product_price) {
          // si oui je lui rajoute une clé $lte
          filters.product_price.$lte = Number(req.query.priceMax);
        } else {
          filters.product_price = { $lte: Number(req.query.priceMax) };
        }
      }

      console.log("filters =>", filters);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//récupérer les détails concernant une annonce, en fonction de son id.
//https://apollo.lereacteur.io/course/64edac602e0f990014023c62/669944268bf61b00158381db

router.get("/offer/:id", async (req, res) => {
  try {
    // console.log(req.params.id);

    const result = await Offer.findById(req.params.id).populate({
      path: "owner",
      select: "account",
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
