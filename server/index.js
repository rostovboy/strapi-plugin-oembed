"use strict";

module.exports = {
  controllers: require("./controllers"),
  services: require("./services"),
  routes: require("./routes"),

  register({ strapi }) {
    strapi.customFields.register({
      name: "oembed",
      plugin: require("../package.json").strapi.name,
      type: "text",
    });
  },
};
