const express = require('express');
const router = express.Router();
const { obtenerJoyas, obtenerJoyasFiltros } = require('../controller/joyasController.js');
const logger = require('../middlewares/logger.js');

router.get('/joyas', logger, obtenerJoyas);
router.get('/joyas/filtros', logger, obtenerJoyasFiltros);

module.exports = router;
