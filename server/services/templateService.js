const mongoose = require('mongoose');
const Template = require('../models/Template');
const HttpError = require('../utils/HttpError');

async function findTemplate(id) {
  if (!mongoose.isObjectIdOrHexString(id)) throw new HttpError(404, 'Template not found.');
  const template = await Template.findById(id);
  if (!template) throw new HttpError(404, 'Template not found.');
  return template;
}

function serializeTemplate(template) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    thumbnail_url: template.thumbnail_url,
    category: template.category,
  };
}

module.exports = { findTemplate, serializeTemplate };
