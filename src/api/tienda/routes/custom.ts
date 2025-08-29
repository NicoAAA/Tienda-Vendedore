module.exports = {
  routes: [
    {
      // i. Ruta para consultar vendedores por nombre de tienda
      method: 'POST',
      path: '/tiendas/vendedores-por-nombre',
      handler: 'tienda.vendedoresByTienda',
    },
    {
      // ii. Ruta para encontrar la tienda de un vendedor por su documento
      method: 'POST',
      path: '/tiendas/tienda-por-vendedor',
      handler: 'tienda.findTiendaByVendedor',
    },
    {
      // iii. Ruta para listar todas las tiendas con los detalles de sus vendedores
      method: 'GET',
      path: '/tiendas-con-vendedores',
      handler: 'tienda.listTiendasWithVendedores',
    },
  ],
};