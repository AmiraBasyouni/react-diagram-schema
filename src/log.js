// function for logging messages:
function log(message, type = "log") {
  if (console[type]) console[type](message);
}

module.exports = log;
