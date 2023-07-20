import { Router } from 'express';
import Product from '../dao/models/products.model.js';
import authMdw from '../middleware/auth.middleware.js';

const router = Router();

// Ruta para visualizar todos los productos con paginación
router.get('/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort === 'desc' ? -1 : 1;
    const query = req.query.query || '';

    // Construir el objeto de filtro
    const filter = {};
    if (query) {
      filter.$or = [
        { category: { $regex: query, $options: 'i' } },
        { availability: { $regex: query, $options: 'i' } },
      ];
    }

    // Calcular el total de páginas y el número de documentos a saltar
    const totalProducts = await Product.countDocuments(filter).lean();
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    // Obtener los productos según los parámetros de la consulta
    const products = await Product.find(filter)
      .sort({ price: sort })
      .limit(limit)
      .skip(skip)
      .lean();

    // Renderizar la vista con los productos y la información de paginación
    res.render('productList', {
      products,
      totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      page,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${req.query.sort}&query=${query}` : null,
      nextLink: page < totalPages ? `/products?limit=${limit}&page=${page + 1}&sort=${req.query.sort}&query=${query}` : null,
    });
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener los productos' });
  }
});

router.get("/login", async (req, res) => {
  res.render("login");
});

router.get("/register", async (req, res) => {
  res.render("register");
});

router.get("/profile", authMdw, async (req, res) => {
  try {
    // Obtener todos los productos
    const products = await Product.find().lean();

    // Renderizar la vista de perfil con los datos del usuario y los productos
    res.render("profile", {
      first_name: req.session?.user?.first_name,
      last_name: req.session?.user?.last_name,
      email: req.session?.user?.email,
      age: req.session?.user?.age,
      products,
    });
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    res.status(500).json({ status: "error", message: "Error al obtener los datos del usuario" });
  }
});

// Exportar el router
export default router;
