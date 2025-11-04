const SimulationResult = require('../models/SimulationResult');
const Strategy = require('../models/Strategy'); // optional for validation

// Save a simulation result
exports.createSimulation = async (req, res) => {
  try {
    const strategyId = req.params.strategyId;
    const { inputs, metrics, raw, notes, version, tags, userId } = req.body;

    // Optional: verify strategy exists
    // const strategy = await Strategy.findById(strategyId);
    // if (!strategy) return res.status(404).json({ error: 'Strategy not found' });

    const sim = await SimulationResult.create({
      strategy: strategyId,
      user: userId || req.user?.id,
      inputs,
      metrics,
      raw,
      notes,
      version,
      tags
    });

    return res.status(201).json(sim);
  } catch (err) {
    console.error('createSimulation error', err);
    return res.status(500).json({ error: err.message });
  }
};

// List simulations for a strategy (pagination + filters)
exports.listByStrategy = async (req, res) => {
  try {
    const { strategyId } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt', from, to, minRoi } = req.query;
    const filter = { strategy: strategyId };
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
    if (minRoi) filter['metrics.roi'] = { $gte: parseFloat(minRoi) };

    const skip = (Number(page) - 1) * Number(limit);
    const simulations = await SimulationResult.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-raw') // omit raw by default to reduce payload
      .lean()
      .exec();

    const total = await SimulationResult.countDocuments(filter);

    res.json({ data: simulations, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error('listByStrategy error', err);
    res.status(500).json({ error: err.message });
  }
};

// Get a single simulation (including raw)
exports.getSimulation = async (req, res) => {
  try {
    const sim = await SimulationResult.findById(req.params.id).lean();
    if (!sim) return res.status(404).json({ error: 'Not found' });
    res.json(sim);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};