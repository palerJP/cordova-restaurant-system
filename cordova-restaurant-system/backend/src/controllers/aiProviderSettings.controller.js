const settings = require('../services/aiProviderSettings.service');
const asyncHandler = require('../utils/asyncHandler');

const getStatus = (req, res) => res.json({ success: true, data: settings.getStatus(req) });
const saveSettings = asyncHandler(async (req, res) => {
  const data = await settings.saveSettings(req, req.body);
  res.json({ success: true, message: 'Local AI provider settings saved.', data });
});
const testConnection = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await settings.testConnection() });
});

module.exports = { getStatus, saveSettings, testConnection };
