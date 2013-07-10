module.exports = function() {
  return this.body(function() {
    return this.block("content");
  });
};
