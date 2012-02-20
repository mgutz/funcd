
module.exports = function(t) {
  return t.body(function() {
    return t.block("content");
  });
};
