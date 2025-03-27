import { factories } from '@strapi/strapi';
import axios from 'axios';

const functionGetTiendaFromVendedor = async (ctx, documentId) => {
  try {
    const token = ctx.request.headers.authorization?.split(" ")[1];
    const response = await axios.get(
      `http://localhost:1337/api/vendedores/${documentId}`,
      {
        params: { populate: 'tienda' },
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Respuesta de axios:", response.data);
    const vendedor = response.data.data;
    const tienda = vendedor.tienda ? vendedor.tienda : null;
    ctx.body = tienda;
    if (!tienda) {
        ctx.send({ message: "El vendedor no tiene tienda asignada" });
      } else {
        const { createdAt, updatedAt, publishedAt, ...customTienda } = tienda; // Elimina campos innecesarios de la respuesta json
        ctx.send(customTienda);
      }
  } catch (error) {
    ctx.throw(500, 'ERROR: No se pudo obtener la tienda del vendedor');
  }
};

export default factories.createCoreController('api::vendedore.vendedore', ({ strapi }) => ({
  async tiendaFromVendedor(ctx) {
    const { documentId } = ctx.params;
    await functionGetTiendaFromVendedor(ctx, documentId);
  }
}));
