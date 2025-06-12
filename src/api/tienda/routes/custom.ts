module.exports = {
    routes: [
      {
        method: 'POST',
        path: '/tiendas/search',
        handler: 'tienda.search',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'POST',
        path: '/tiendas/vendedores',
        handler: 'tienda.vendedoresByTienda',
        config: {
          policies: [],
          middlewares: [],
        },
      },
      {
        method: 'GET',
        path: '/tiendas-with-count',
        handler: 'tienda.listTiendasWithCount',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
  