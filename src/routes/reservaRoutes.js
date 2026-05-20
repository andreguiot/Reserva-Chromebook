const { Router } = require('express');
const ReservaController = require('../controllers/ReservaController');

const router = Router();

router.get('/', ReservaController.listar);
router.post('/', ReservaController.criar);
router.get('/:id/chromebooks', ReservaController.listarChromebooks);
router.post('/:id/escanear', ReservaController.escanear);
router.put('/:id/validar', ReservaController.validar);
router.put('/:id/encerrar', ReservaController.encerrar);

module.exports = router;
