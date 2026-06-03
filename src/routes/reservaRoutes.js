const { Router } = require('express');
const ReservaController = require('../controllers/ReservaController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const validar = require('../middlewares/validatorMiddleware');
const { criarReservaSchema } = require('../validators/reservaValidator');

const router = Router();

router.get('/', authMiddleware, ReservaController.listar);
router.post('/', authMiddleware, validar(criarReservaSchema), ReservaController.criar);
router.get('/:id/chromebooks', authMiddleware, ReservaController.listarChromebooks);
router.post('/:id/escanear', authMiddleware, adminMiddleware, ReservaController.escanear);
router.put('/:id/validar', authMiddleware, adminMiddleware, ReservaController.validar);
router.put('/:id/encerrar', authMiddleware, adminMiddleware, ReservaController.encerrar);

module.exports = router;
