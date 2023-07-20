import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import Product from '../dao/models/products.model.js';

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const body = req.body;
    const newUser = await userModel.create(body);
    console.log("nuevo usuario:",newUser);

    req.session.user = { ...body };
    return res.render("login");
  } catch (error) {
    console.log("error:",error);
  }
});

router.post("/login", async (req, res) => {
  try {
    //para validar el login con email y contraseña
    const { email, password } = req.body;
    const session = req.session;
    console.log(
      "🚀 ~ file: session.routes.js:17 ~ router.post ~ session:",
      session
    );

    const findUser = await userModel.findOne({ email });
    console.log("usuario encontrado:",findUser);

    if (!findUser) {
      return res
        .status(401)
        .json({ message: "usuario no registrado/existente" });
    }

    if (findUser.password !== password) {
      return res
        .status(401)
        .json({ message: "password incorrecto" });
    }

    req.session.user = {
      ...findUser.toObject(),
      password: "",
    };

    // Obtener todos los productos
    const products = await Product.find().lean();

    return res.render('profile',{
      first_name: req.session?.user?.first_name || findUser.first_name,
      last_name: req.session?.user?.last_name || findUser.last_name,
      email: req.session?.user?.email || email,
      age: req.session?.user?.age || findUser.age,
      products,
      
      
    }, );
  } catch (error) {
    
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (!err) return res.redirect("/login");
    return res.send({ message: `logout Error`, body: err });
  });
});

export default router;
