"use strict";

const getService = (name) => strapi.plugin("oembed").service(name);
module.exports = { getService };
