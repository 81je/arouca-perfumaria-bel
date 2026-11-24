
const { MercadoPagoConfig, Preference } = require('mercadopago');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN
    });

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: req.body.items,
        back_urls: {
          success: 'https://81je.github.io/arouca-perfumaria-bel/',
          failure: 'https://81je.github.io/arouca-perfumaria-bel/',
          pending: 'https://81je.github.io/arouca-perfumaria-bel/'
        },
        auto_return: 'approved'
      }
    });

    return res.status(200).json({
      id: result.id,
      init_point: result.init_point
    });
  } catch (error) {
    return res.status(500).json({ error: 'Não foi possível criar o pagamento.' });
  }
};
