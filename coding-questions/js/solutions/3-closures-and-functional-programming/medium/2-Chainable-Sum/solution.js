function add(num) {
  return {
    add: function (nextNum) {
      return add(num + nextNum);
    },
  };
}
