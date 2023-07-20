import { Router } from "express";
import Cart from '../cart.js';
import ProductManager from "../dao/managers/fsproductmanager.js";

// Importar los módulos necesarios

import CartModel from '../dao/models/carts.model.js';
import Product from "../dao/models/products.model.js";


// Crear el router
const router = Router();

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    // Crea un nuevo carrito vacío con el nombre proporcionado
    const newCart = new CartModel({
      name,
      products: [],
    });

    // Guarda el nuevo carrito en la base de datos
    await newCart.save();

    res.status(201).json({ status: "success", message: "Carrito creado exitosamente", cartId: newCart._id });
  } catch (error) {
    console.error("Error al crear el carrito:", error);
    res.status(500).json({ status: "error", message: "Error al crear el carrito" });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    // Buscar el carrito según el ID
    const cart = await CartModel.findById(cid);

    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    // Eliminar el producto del carrito
    cart.products = cart.products.filter((product) => product.productId.toString() !== pid);

    // Guardar los cambios en el carrito
    await cart.save();

    res.json({ status: "success", message: "Producto eliminado del carrito exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto del carrito:", error);
    res.status(500).json({ status: "error", message: "Error al eliminar el producto del carrito" });
  }
});

// Actualizar el carrito con un arreglo de productos
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    // Buscar el carrito según el ID
    const cart = await CartModel.findById(cid);

    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    // Limpiar el arreglo de productos actual en el carrito
    cart.products = [];

    // Recorrer el arreglo de productos recibidos y agregarlos al carrito
    for (const product of products) {
      const { productId, quantity } = product;

      // Verificar si el producto existe en la base de datos
      const existingProduct = await Product.findById(productId);

      if (existingProduct) {
        cart.products.push({ productId, quantity });
      }
    }

    // Guardar los cambios en el carrito
    await cart.save();

    res.json({ status: "success", message: "Carrito actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el carrito:", error);
    res.status(500).json({ status: "error", message: "Error al actualizar el carrito" });
  }
});

// Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    // Buscar el carrito según el ID
    const cart = await CartModel.findById(cid);

    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    // Buscar el producto en el carrito y actualizar la cantidad
    const product = cart.products.find((product) => product.productId.toString() === pid);

    if (product) {
      product.quantity = quantity;
      await cart.save();

      res.json({ status: "success", message: "Cantidad de producto actualizada exitosamente" });
    } else {
      res.status(404).json({ status: "error", message: "Producto no encontrado en el carrito" });
    }
  } catch (error) {
    console.error("Error al actualizar la cantidad del producto en el carrito:", error);
    res.status(500).json({ status: "error", message: "Error al actualizar la cantidad del producto en el carrito" });
  }
});

// Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    // Buscar el carrito según el ID
    const cart = await CartModel.findById(cid);

    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    // Vaciar el arreglo de productos del carrito
    cart.products = [];

    // Guardar los cambios en el carrito
    await cart.save();

    res.json({ status: "success", message: "Productos eliminados del carrito exitosamente" });
  } catch (error) {
    console.error("Error al eliminar los productos del carrito:", error);
    res.status(500).json({ status: "error", message: "Error al eliminar los productos del carrito" });
  }
});


// Obtener el carrito completo con los productos asociados
/*
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    // Buscar el carrito según el ID y hacer populate de los productos
    const cart = await CartModel.findById(cid).populate("products.productId");

    // Verificar si el carrito existe
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    res.json({ status: "success", cart });
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ status: "error", message: "Error al obtener el carrito" });
  }
});
*/

// Exportar el router
export default router;


