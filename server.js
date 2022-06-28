var liveServer = require("live-server");

var params = {
  port: process.env.PORT || 3000, // Set the server port. Defaults to 8080.
  open: false, // When false, it won't load your browser by default.
  ignore: "node_modules", // comma-separated string for paths to ignore
  file: "error/404.html", // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
  logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
};

liveServer.start(params);
