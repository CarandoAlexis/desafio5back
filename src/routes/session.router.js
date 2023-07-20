import { Router } from "express";
import userModel from "../dao/models/user.model.js";
import Product from '../dao/models/products.model.js';

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const body = req.body;

    // Verificar si el correo electrónico ya existe en la base de datos
    const existingUser = await userModel.findOne({ email: body.email });

    if (existingUser) {
      // Si el correo electrónico ya existe, enviar un mensaje de error
      return res.redirect("/register?error=El correo electrónico ya está registrado");
    }

    // Verificar si el usuario a registrar es el administrador
    const isAdmin = body.email === "adminCoder@coder.com" && body.password === "adminCod3r123";

    // Agregar el rol "admin" si es el administrador, de lo contrario, agregar "usuario"
    const newUser = await userModel.create({
      ...body,
      role: isAdmin ? "admin" : "usuario",
    });

    console.log("nuevo usuario:", newUser);

    req.session.user = { ...newUser.toObject() };
    return res.redirect("/login");
  } catch (error) {
    console.log("error:", error);
    // Manejar otros errores aquí, si es necesario
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

router.post("/login", async (req, res) => {
  try {
    // Para validar el login con email y contraseña
    const { email, password } = req.body;

    // Obtener la sesión actual
    const session = req.session;

    const findUser = await userModel.findOne({ email });

    if (!findUser) {
      return res.status(401).json({ message: "Usuario no registrado/existente" });
    }

    if (findUser.password !== password) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Verifica el rol del usuario
    if (findUser.email === "adminCoder@coder.com" && findUser.password === "admin") {
      findUser.role = "admin";
    } else {
      findUser.role = "usuario";
    }

    // Establece el usuario en la sesión
    session.user = {
      ...findUser.toObject(),
      password: "",
    };

    console.log("Usuario establecido en la sesión:", session.user);

    // Para obtener todos los productos
    const products = await Product.find().lean();

    // Renderiza la vista de perfil con los datos del usuario y los productos
    return res.render("profile", {
      first_name: session?.user?.first_name || findUser.first_name,
      last_name: session?.user?.last_name || findUser.last_name,
      email: session?.user?.email || email,
      age: session?.user?.age || findUser.age,
      role: session?.user?.role,
      products,
    });
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    res.status(500).json({ status: "error", message: "Error al obtener los datos del usuario" });
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (!err) return res.redirect("/login");
    return res.send({ message: `logout Error`, body: err });
  });
});

export default router;
