//middleware para verificar sesion en backend
const authMdw = (req, res, next) => {
  if (req.session?.user) {
    return next();
  }

  // Si el usuario no está autenticado, simplemente continuar con el siguiente middleware
  return res.redirect("/login");
};
  
export default authMdw;