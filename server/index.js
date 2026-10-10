// Preserve the Step 1 entry point for existing terminal sessions.
const server = require('./server');

if (require.main === module) server.main();

module.exports = server;
