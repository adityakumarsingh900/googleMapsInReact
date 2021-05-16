function List(data) {
  this.name = data.name;

  this.toString = function () {
    return JSON.stringify(this);
  };

  this.toJSON = function () {
    const data = {
      name: this.name,
    };
    return data;
  };
}

export default List;
