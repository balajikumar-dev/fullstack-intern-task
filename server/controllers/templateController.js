const Template = require('../models/Template');
const HttpError = require('../utils/HttpError');
const { findTemplate, serializeTemplate } = require('../services/templateService');

function readFilter(value, maxLength) {
  if (value === undefined) return '';
  if (typeof value !== 'string' || value.length > maxLength)
    throw new HttpError(400, 'Invalid template filter.');
  return value.trim();
}

async function list(req, res) {
  const search = readFilter(req.query.search, 150);
  const category = readFilter(req.query.category, 80);
  const query = {};
  if (category && category !== 'All') query.category = category;
  if (search) {
    // Treat user input as literal text, never an executable regular expression.
    const literal = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = ['name', 'description'].map((field) => ({
      [field]: { $regex: literal, $options: 'i' },
    }));
  }
  const templates = await Template.find(query).sort({ _id: 1 });
  res.json({ templates: templates.map(serializeTemplate) });
}

async function detail(req, res) {
  const template = await findTemplate(req.params.id);
  res.json({ template: serializeTemplate(template) });
}

module.exports = { list, detail };
