module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/vendedores/:documentId/tienda',
        handler: 'vendedore.tiendaFromVendedor',
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ],
  };
  