const pluginPkg = require("../../package.json");
module.exports = pluginPkg.name.replace(/^strapi-plugin-/i, "");
