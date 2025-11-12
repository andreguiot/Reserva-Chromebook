const { Router } = require('express');
const ReservaController = require('../controllers/ReservaController');

const router = Router();

router.get('/', ReservaController.listar);
router.post('/', ReservaController.criar);
router.post('/:id/escanear', ReservaController.escanear);
router.put('/:id/encerrar', ReservaController.encerrar);

module.exports = router;
