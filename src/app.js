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
    // Crear instancias de los managers y modelos después de que se haya establecido la conexión a la base de datos

    const productManager = new MongoProductManager();
    const cartModel = new CartModel();

    // Crear la aplicación Express y configurarla
    const app = express();
    const port = 8008;
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
    app.use("/products", authMdw, (req, res, next) => {
      return res.render("productList");
    });
    app.use("/api/session/", sessionRouter);
    app.use("/profile", authMdw, (req, res, next) => {
      // En esta parte solo estamos verificando que el usuario esté autenticado y luego dejamos que el siguiente middleware maneje la lógica de renderizar la vista de perfil.
      next();
    });

    const server = app.listen(port, () => {
      displayRoutes(app);
      console.log(`Server listening on port ${port}`);
    });
    
   
    
  });

