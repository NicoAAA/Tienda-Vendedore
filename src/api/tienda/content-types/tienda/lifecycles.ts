import { errors } from '@strapi/utils';
const { ApplicationError } = errors;

async function validarYTransformarVendedores(data: any, currentTiendaId: number | null = null) {
  const numerosDeDocumento = data.vendedores;

  if (!Array.isArray(numerosDeDocumento) || numerosDeDocumento.length === 0) {
    throw new ApplicationError("Cada tienda debe tener al menos un vendedor asignado.");
  }

  const vendedorIds = [];

  for (const n_Documento of numerosDeDocumento) {
    const vendedor = await strapi.db.query("api::vendedore.vendedore").findOne({
      where: { n_Documento: n_Documento },
    });

    if (!vendedor) {
      throw new ApplicationError(`El vendedor con documento '${n_Documento}' no existe.`);
    }

    // LÓGICA CAMBIADA: Busca si alguna tienda ya contiene a este vendedor
    const tiendaExistente = await strapi.db.query('api::tienda.tienda').findOne({
      where: {
        vendedores: { id: vendedor.id },
        // Excluye la tienda actual en caso de una actualización
        ...(currentTiendaId && { id: { $ne: currentTiendaId } })
      }
    });

    if (tiendaExistente) {
      throw new ApplicationError(
        `El vendedor ${vendedor.Nombre} (doc: ${n_Documento}) ya está asignado a la tienda '${tiendaExistente.Nombre}'.`
      );
    }
    
    vendedorIds.push(vendedor.id);
  }

  data.vendedores = vendedorIds;
}


export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    // Solo se ejecuta la validación si se envían vendedores en la petición
    if (data.vendedores) {
      await validarYTransformarVendedores(data);
    } else {
        // Si no se envían vendedores en el array, lanzamos el error de la regla i.
        throw new ApplicationError("Cada tienda debe tener al menos un vendedor asignado.", {
            rule: "min-vendedores"
        });
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    const tiendaId = where.id;

    // Solo se ejecuta si el campo 'vendedores' está presente en la petición de actualización
    if (data.vendedores) {
      await validarYTransformarVendedores(data, tiendaId);
    }
  },
};  