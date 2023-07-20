import fs from 'fs';

class ProductManager {
  constructor(path) {
    this.path = path;
    try {
      const data = fs.readFileSync(this.path);
      this.products = JSON.parse(data);
      this.currentId = this.products.reduce((acc, product) => Math.max(acc, product.id), 0);
    } catch (error) {
      this.products = [];
      this.currentId = 0;
    }
  }

  saveProducts() {
    const data = JSON.stringify(this.products, null, 2);
    fs.writeFileSync(this.path, data);fsproductmanager
  }

  addProduct(title, description, price, thumbnail, code, categoria ) {
    if (!title || !description || !price || !thumbnail || !code || !categoria) {
      throw new Error('Todos los campos son obligatorios');
    }

    if (this.products.some((product) => product.code === code)) {
      throw new Error('El código del producto ya existe');
    }

    const product = {
      id: ++this.currentId,
      title,
      description,
      price,
      thumbnail,
      code,
      categoria,
    };
    this.products.push(product);
    this.saveProducts();
    
    
  }

  getProducts() {
    try {
      const data = fs.readFileSync(this.path);
      return JSON.parse(data);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  getProductById(id) {
    const product = this.products.find((product) => product.id === id);
    if (!product) {
      console.error('Not Found');
      return null;
    }
    return product;
  }

  updateProduct(id, updatedFields) {
    const productIndex = this.products.findIndex((product) => product.id === id);
    if (productIndex === -1) {
      console.error('Not Found');
      return;
    }

    const product = this.products[productIndex];
    const updatedProduct = {
      ...product,
      ...updatedFields,
      id: product.id,
    };
  
    this.products.splice(productIndex, 1, updatedProduct);
    this.saveProducts();
  
  }

  deleteProduct(id) {
    const productIndex = this.products.findIndex((product) => product.id === id);
    if (productIndex === -1) {
      console.error('Not Found');
      return;
    }

    this.products.splice(productIndex, 1);
    this.saveProducts();
  }
}
const productManager = new ProductManager('products.json');


export default ProductManager;

/* Formato para agregar producto en JSON
en postman usar este formato
{
    "title": "Producto Prueba 2",
    "description": "Descripcion de Producto Prueba 2",
    "price": 300,
    "thumbnail": "sin imagen",
    "code": "P1",
    "stock": 300
}
*/

