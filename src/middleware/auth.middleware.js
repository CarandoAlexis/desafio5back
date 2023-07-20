//middleware para verificar sesion en backend
const authMdw = (req, res, next) => {
  console.log("Sesion:", req.session);
  if (req.session?.user) {
    return next();
  }

  // Si el usuario no está autenticado, simplemente continua al /login
  return res.redirect("/login");
};
  
export default authMdw;