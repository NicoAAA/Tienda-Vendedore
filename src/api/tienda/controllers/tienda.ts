/**
 * tienda controller
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';
import database from '../../../../config/database';

/* 
    Funcion que obtiene los vendedores de una tienda
    @param ctx: Contexto de la petición
    @param documentId: Identificador de la tienda
*/



  const functionListTiendasWithCount = async (ctx) => {
    try {
      const token = ctx.request.headers.authorization?.split(" ")[1];
  
      // Consulta todas las tiendas sin población de la relación.
      const tiendasResponse = await axios.get(
        'http://localhost:1337/api/tiendas',
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      const tiendas = tiendasResponse.data.data;
      if (!Array.isArray(tiendas)) {
        ctx.throw(500, 'ERROR: La respuesta no contiene un array de tiendas');
      }
      
      // Para cada tienda, se realiza una consulta a la colección de vendedores filtrando por tienda.id
      const customResponse = await Promise.all(
        tiendas.map(async (tienda) => {
          const tiendaData = tienda.attributes || tienda;
          const nombreTienda = tiendaData.Nombre;
          
          // Se consulta la colección de vendedores filtrando por la tienda (usando el id interno de la tienda)
          const vendedoresResponse = await axios.get(
            'http://localhost:1337/api/vendedores',
            {
              params: {
                'filters[tienda][id][$eq]': tienda.id
              },
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          // La cantidad de vendedores es la longitud del array de datos
          const countVendedores = vendedoresResponse.data.data.length;
          return {
            Tienda: nombreTienda,
            NumeroVendedores: countVendedores
          };
        })
      );
      
      ctx.send(customResponse);
    } catch (error) {
      console.error("Error en functionListTiendasWithCount:", error.response?.data || error.message);
      ctx.throw(500, 'ERROR: No se pudo listar las tiendas con el número de vendedores');
    }
  };
  


/*   
Export the controller: Sirve para extender la funcionalidad de un controlador existente,
en este caso el controlador de la entidad tienda y se añaden dos nuevos métodos
endedoresByTienda y listTiendasWithCount.
*/

export default factories.createCoreController('api::tienda.tienda', ({ strapi }) => ({
  async search(ctx) {
    const { filters, populate } = ctx.request.body;
    try {
      const results = await strapi.db.query('api::tienda.tienda').findMany({
        where: filters,
        populate: populate,
      });
      ctx.body = { data: results };
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      ctx.throw(500, "Error en la búsqueda");
    }
  },
  async vendedoresByTienda(ctx) {
    // Validar token
    const token = ctx.request.headers.authorization?.split(' ')[1];
    if (!token) {
      return ctx.unauthorized("No se ha enviado un token de autorización");
    }
    // Extraer documentId del body de la petición
    const { data: { documentId } = { documentId: null } } = ctx.request.body;
    if (!documentId) {
      return ctx.throw(400, "ERROR: El documentId de la tienda es requerido en el body");
    }

    try {
      // Realiza una consulta POST a un endpoint custom que realice la búsqueda.
      // Este endpoint debe estar configurado en las rutas para aceptar POST.
      const response = await axios.post(
        'http://localhost:1337/api/tiendas/search',
        {
          filters: { documentId: { $eq: documentId } },
          populate: 'vendedores'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Respuesta de axios:", JSON.stringify(response.data, null, 2));

      if (!response.data.data || response.data.data.length === 0) {
        return ctx.throw(400, "ERROR: No se encontró la tienda con el documentId proporcionado");
      }

      const tienda = response.data.data[0];
      const vendedores = tienda.attributes.vendedores && tienda.attributes.vendedores.data
        ? tienda.attributes.vendedores.data
        : [];

      ctx.body = {
        message: 'Lista de vendedores que trabajan en la tienda ' + tienda.attributes.Nombre,
        vendedores: vendedores
      };
    } catch (error) {
      console.error("Error en la consulta con axios:", error.response?.data || error.message);
      return ctx.throw(500, "Error en la consulta");
    }
  },

    

    async listTiendasWithCount(ctx) {
        console.log("EndPoint /api/tiendas-with-count");
        const token = ctx.request.headers.authorization?.split(" ")[1];
        if (!token) {
          return ctx.unauthorized("Token no incluido en la petición");
        }
        await functionListTiendasWithCount(ctx);
      }
}));
