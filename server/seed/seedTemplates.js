const seedTemplates = require('../scripts/seed');

if (require.main === module) seedTemplates.main();

module.exports = seedTemplates;
