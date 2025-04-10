const { ApplicationError } = require("@strapi/utils").errors;

module.exports = {
  async beforeCreate(event: any) {
    const { data } = event.params;

    console.log("RAW data.vendedores:", data.vendedores);

    // Extraer correctamente IDs de vendedores
    let vendedoresIDs = [];

    if (
      data.vendedores &&
      typeof data.vendedores === "object" &&
      Array.isArray(data.vendedores.set)
    ) {
      vendedoresIDs = data.vendedores.set.map((v) =>
        typeof v === "object" && v.id ? v.id : v
      );
    }

    console.log("Normalizados vendedoresIDs:", vendedoresIDs);

    // Regla 1: Validar que haya al menos un vendedor
    if (!Array.isArray(vendedoresIDs) || vendedoresIDs.length === 0) {
      throw new ApplicationError("Cada tienda debe tener al menos un vendedor asignado.");
    }

    // Regla 2: Validar que los vendedores no estén asignados a otra tienda
    for (const vendedorID of vendedoresIDs) {
      const vendedor = await strapi.db.query("api::vendedore.vendedore").findOne({
        where: { id: vendedorID },
        populate: { tienda: true },
      });

      if (vendedor && vendedor.tienda) {
        throw new ApplicationError(`El vendedor con Id ${vendedorID} ya está asignado a otra tienda.`);
      }
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    let vendedoresIDs = [];

    if (
      data.vendedores &&
      typeof data.vendedores === "object" &&
      Array.isArray(data.vendedores.set)
    ) {
      vendedoresIDs = data.vendedores.set.map((v) =>
        typeof v === "object" && v.id ? v.id : v
      );
    }

    if (vendedoresIDs.length === 0) {
      throw new ApplicationError("Cada tienda debe tener al menos un vendedor asignado.");
    }

    for (const vendedorID of vendedoresIDs) {
      const vendedor = await strapi.db.query("api::vendedore.vendedore").findOne({
        where: { id: vendedorID },
        populate: { tienda: true },
      });

      if (vendedor && vendedor.tienda && vendedor.tienda.id !== where.id) {
        throw new ApplicationError(`El vendedor con Id ${vendedorID} ya está asignado a otra tienda.`);
      }
    }
  },
};

