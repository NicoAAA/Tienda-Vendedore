/**
 * tienda controller
 */

import { factories } from '@strapi/strapi';
import axios from 'axios';

/* 
    Funcion que obtiene los vendedores de una tienda
    @param ctx: Contexto de la petición
    @param documentId: Identificador de la tienda
*/
const functionGetVendedoresByTienda = async (ctx, documentId) => {
    try {
      const token = ctx.request.headers.authorization?.split(" ")[1];
      const response = await axios.get(
        'http://localhost:1337/api/vendedores',
        {
          params: {
            'filters[tienda][documentId][$eq]': documentId,
            populate: '*'
          },
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      ctx.body = response.data;
    } catch (error) {
      // Imprime información del error para depurar
      console.error("Error en functionGetVendedoresByTienda:", error.message);
      if (error.response) {
        console.error("Datos del error:", error.response.data);
      }
      ctx.throw(500, `ERROR: No se pudo obtener los vendedores de la tienda - ${error.message}`);
    }
  };


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
export default factories.createCoreController('api::tienda.tienda',({ strapi }) => ({
    // Funcion que obtiene los vendedores de una tienda
    async vendedoresByTienda(ctx) {
        console.log("EndPoint /api/tiendas/:documentId/vendedores");
        const token = ctx.request.headers.authorization?.split(' ')[1];
        if (!token) {
            return ctx.unauthorized("No se ha enviado un token de autorización");
        }
        const { documentId } = ctx.params;
        try{
            await functionGetVendedoresByTienda(ctx,documentId);
        } catch (error) {
            ctx.throw(500, "ERROR: No se pudo obtener los vendedores de la tienda");
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
