const pool = require('../config/db.js');
const format = require('pg-format');

const obtenerJoyas = async (req, res) => {
  try {
    const { limits = 10, page = 1, order_by = 'id_ASC' } = req.query;
    const offset = (page - 1) * limits;

    const [campo, direccion] = order_by.split('_');
    const ordenValido = ['ASC', 'DESC'].includes(direccion) &&
      ['id', 'nombre', 'categoria', 'metal', 'precio', 'stock'].includes(campo);

    if (!ordenValido) {
      return res.status(400).json({ error: 'Parámetro order_by no válido' });
    }

    const consulta = format(
      'SELECT * FROM inventario ORDER BY %I %s LIMIT %s OFFSET %s',
      campo,
      direccion,
      limits,
      offset
    );

    const conteoConsulta = 'SELECT COUNT(*) FROM inventario';

    const [joyasResult, conteoResult] = await Promise.all([
      pool.query(consulta),
      pool.query(conteoConsulta)
    ]);

    const joyas = joyasResult.rows;
    const total = parseInt(conteoResult.rows[0].count);
    const totalPages = Math.ceil(total / limits);

    const HATEOAS = {
      joyas: joyas.map(joya => ({
        ...joya,
        links: {
          self: `/joyas/${joya.id}`,
          collection: '/joyas'
        }
      })),
      meta: {
        totalPages,
        currentPage: parseInt(page),
        totalItems: total
      },
      links: {
        self: `/joyas?limits=${limits}&page=${page}&order_by=${order_by}`,
        next: page < totalPages ? `/joyas?limits=${limits}&page=${parseInt(page) + 1}&order_by=${order_by}` : null,
        prev: page > 1 ? `/joyas?limits=${limits}&page=${parseInt(page) - 1}&order_by=${order_by}` : null
      }
    };

    res.json(HATEOAS);
  } catch (error) {
    console.error('Error en obtenerJoyas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const obtenerJoyasFiltros = async (req, res) => {
  try {
    const { precio_max, precio_min, categoria, metal } = req.query;
    let consulta = 'SELECT * FROM inventario WHERE 1=1';
    const valores = [];
    let paramCount = 1;

    if (precio_max) {
      consulta += ` AND precio <= $${paramCount}`;
      valores.push(precio_max);
      paramCount++;
    }

    if (precio_min) {
      consulta += ` AND precio >= $${paramCount}`;
      valores.push(precio_min);
      paramCount++;
    }

    if (categoria) {
      consulta += ` AND categoria = $${paramCount}`;
      valores.push(categoria);
      paramCount++;
    }

    if (metal) {
      consulta += ` AND metal = $${paramCount}`;
      valores.push(metal);
      paramCount++;
    }

    const { rows: joyas } = await pool.query(consulta, valores);

    const HATEOAS = {
      joyas: joyas.map(joya => ({
        ...joya,
        links: {
          self: `/joyas/${joya.id}`,
          collection: '/joyas'
        }
      })),
      meta: {
        totalItems: joyas.length
      }
    };

    res.json(HATEOAS);
  } catch (error) {
    console.error('Error en obtenerJoyasFiltros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerJoyas,
  obtenerJoyasFiltros
};