module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/tiendas/:documentId/vendedores',
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
  