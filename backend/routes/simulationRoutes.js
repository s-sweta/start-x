const express = require('express');
const router = express.Router();
const simCtrl = require('../controllers/simulationController');
const auth = require('../middleware/authMiddleware'); // reuse your auth

// create simulation result for a strategy
router.post('/strategies/:strategyId/simulations', auth, simCtrl.createSimulation);

// list simulations for strategy
router.get('/strategies/:strategyId/simulations', auth, simCtrl.listByStrategy);

// get single simulation by id
router.get('/simulations/:id', auth, simCtrl.getSimulation);

module.exports = router;