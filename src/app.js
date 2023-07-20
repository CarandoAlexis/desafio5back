import express from "express";
import { Server } from "socket.io";
import handlebars from "express-handlebars";
import viewsRouter from "./routes/views.router.js";
import __dirname from "./utils.js";
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import displayRoutes from "express-routemap";
import connectDatabase from './services/mongodb.service.js';
import cookieParser from "cookie-parser";
import CartModel from "./dao/models/carts.model.js";
import MongoProductManager from "./dao/managers/mongoproductmanager.js";
import session from "express-session";
import sessionRouter from "./routes/session.router.js"
import authMdw from "./middleware/auth.middleware.js";
import mongoStore from "connect-mongo";

// Conexión a la base de datos
connectDatabase()
  .then(() => {
    // Crea instancias de los managers y modelos después de que se haya establecido la conexión a la base de datos

    const productManager = new MongoProductManager();
    const cartModel = new CartModel();

  
    const app = express();
    const port = 8080;
    app.use(express.static(`${__dirname}/public`));
    app.engine("handlebars", handlebars.engine());
    app.set("views", `${__dirname}/views`);
    app.set("view engine", "handlebars");
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/", viewsRouter);
    app.use("/api/products", productsRouter);
    app.use("/api/carts", cartsRouter);
    
    app.use(session({
      store: mongoStore.create({
        mongoUrl: 'mongodb+srv://alexiscarando:u7Y4zRGys6yAY6xC@cluster0.qoopwxe.mongodb.net/ecommerce',
        mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
        ttl: 60*3600,
      }),
      secret: "alexisSession",
      resave: false,
      saveUninitialized: false,
    }))
    
    app.use("/products", authMdw , (req, res, next) => {
      return res.render("productList");
    });
    app.get("/profile", authMdw, async (req, res) => {
      try {
        // Renderiza la vista de perfil con los datos del usuario
        res.render("profile", {
          first_name: req.session?.user?.first_name,
          last_name: req.session?.user?.last_name,
          email: req.session?.user?.email,
          age: req.session?.user?.age,
        });
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        res.status(500).json({ status: "error", message: "Error al obtener los datos del usuario" });
      }
    });
    app.use("/api/session/", sessionRouter);
    

    app.listen(port, () => {
      displayRoutes(app);
      console.log(`Server listening on port ${port}`);
    });
    
   
    
  });

