module.exports = function({ types: t }) {
  return {
    visitor: {
      Identifier(path, state) {
        console.log("this is the current path", path);
      },
    },
  };
};
