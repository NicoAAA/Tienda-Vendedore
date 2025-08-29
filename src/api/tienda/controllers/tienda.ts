import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::tienda.tienda', ({ strapi }) => ({

  /**
   * i. Consultar los vendedores que trabajan en una tienda específica.
   * Método: POST
   * Body esperado: { "Nombre": "Nombre de la Tienda" }
   */
  async vendedoresByTienda(ctx) {
    const { Nombre } = ctx.request.body;

    if (!Nombre) {
      return ctx.badRequest("El 'Nombre' de la tienda es requerido en el body.");
    }

    try {
      // Buscamos la tienda por su nombre y poblamos la relación con vendedores
      const tienda = await strapi.db.query('api::tienda.tienda').findOne({
        where: { Nombre: Nombre },
        populate: ['vendedores'],
      });

      if (!tienda) {
        return ctx.notFound(`No se encontró la tienda con el nombre '${Nombre}'.`);
      }

      ctx.body = {
        message: `Lista de vendedores para la tienda '${Nombre}'`,
        vendedores: (tienda as any).vendedores || [],
      };
    } catch (error) {
      console.error("Error en vendedoresByTienda:", error);
      ctx.internalServerError("Error al consultar los vendedores.");
    }
  },

  /**
   * ii. Obtener información sobre la tienda a la que está asignado un vendedor.
   * Método: POST
   * Body esperado: { "n_Documento": "12345678" }
   */
  async findTiendaByVendedor(ctx) {
    const { n_Documento } = ctx.request.body;

    if (!n_Documento) {
      return ctx.badRequest("El 'n_Documento' del vendedor es requerido en el body.");
    }

    try {
      // PASO 1 (Opcional pero recomendado): Verificar que el vendedor realmente exista.
      const vendedor = await strapi.db.query('api::vendedore.vendedore').findOne({
        where: { n_Documento: n_Documento },
      });

      if (!vendedor) {
        return ctx.notFound(`No se encontró un vendedor con el documento '${n_Documento}'.`);
      }

      // PASO 2: Buscar en la colección de Tiendas para encontrar cuál de ellas
      // contiene al vendedor en su campo de relación 'vendedores'.
      const tiendaEncontrada = await strapi.db.query('api::tienda.tienda').findOne({
        where: {
          vendedores: {
            id: vendedor.id // Se filtra por el ID del vendedor dentro de la relación.
          }
        }
      });

      if (!tiendaEncontrada) {
        return ctx.ok({
            message: `El vendedor ${vendedor.Nombre} ${vendedor.Apellido} con c.c. ${vendedor.n_Documento} no está asignado a ninguna tienda.`
        });
      }

      ctx.body = {
        message: `Tienda asignada al vendedor con documento '${n_Documento}'`,
        tienda: tiendaEncontrada,
      };
    } catch (error) {
      console.error("Error en findTiendaByVendedor:", error);
      ctx.internalServerError("Error al consultar la tienda del vendedor.");
    }
  },
  
  /**
   * iii. Listar todas las tiendas junto con sus vendedores.
   * Método: GET
   * Respuesta: Nombre y dirección de la tienda, con los vendedores asociados.
   */
  async listTiendasWithVendedores(ctx) {
    try {
      const tiendas = await strapi.entityService.findMany('api::tienda.tienda', {
        // Poblamos la relación 'vendedores' y seleccionamos solo los campos que necesitamos
        populate: {
          vendedores: {
            fields: ['Nombre', 'Apellido', 'n_Documento'],
          },
        },
      });

      // Mapeamos la respuesta para que tenga el formato exacto que necesitas
      const respuestaFormateada = tiendas.map(tienda => ({
        Nombre_Tienda: tienda.Nombre,
        Direccion_Tienda: tienda.Direccion,
        Vendedores_Asociados: (tienda as any).vendedores || [],
      }));

      ctx.send(respuestaFormateada);

    } catch (error) {
      console.error("Error en listTiendasWithVendedores:", error);
      ctx.internalServerError("Error al listar las tiendas con sus vendedores.");
    }
  }
}));