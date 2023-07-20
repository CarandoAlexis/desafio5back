import fs from 'fs';

class Cart {
  constructor(path) {
    this.path = path;
    try {
      const data = fs.readFileSync(this.path);
      this.carts = JSON.parse(data);
      this.currentId = this.carts.reduce((acc, cart) => Math.max(acc, cart.id), 0);
    } catch (error) {
      this.carts = [];
      this.currentId = 0;
    }
  }

  saveCarts() {
    const data = JSON.stringify(this.carts, null, 2);
    fs.writeFileSync(this.path, data);
  }

  addCart() {
    const cart = {
      id: ++this.currentId,
      products: [],
    };
    this.carts.push(cart);
    this.saveCarts();
    return cart.id;
  }

  getCartById(cid) {
    const cartId = parseInt(cid);
    const cart = this.carts.find((cart) => cart.id === cartId);
    if (!cart) {
      console.error('Cart Not Found');
      return null;
    }
    return cart;
  }
  
  getCarts() {
    return this.carts;
  }


  addProductToCart(cartId, productId, productManager) {
    const cart = this.getCartById(cartId);
    if (!cart) {
      console.error('Cart Not Found');
      return;
    }
    const product = productManager.getProductById(productId);
    if (!product) {
      console.error('Product Not Found');
      return;
    }

    /*Verifica si el producto ya está en el carrito*/
    const productIndex = cart.products.findIndex((item) => item.id === product.id);
    if (productIndex !== -1) {
      /*Si el producto ya existe, incrementa la cantidad sin repetir el id*/
      cart.products[productIndex].quantity++;
    } else {
      /*Si el producto no existe se agrega con una cantidad de 1*/
      cart.products.push({ id: product.id, quantity: 1 });
    }

    this.saveCarts();
  }
}

export default Cart;