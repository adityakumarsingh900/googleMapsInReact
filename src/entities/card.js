function Card(data) {
  this.name = data.name;
  this.desc = data.desc;

  this.toString = function () {
    return JSON.stringify(this);
  };

  this.toJSON = function () {
    const data = {
      name: this.name,
      desc: this.desc,
    };
    return data;
  };
}

export default Card;
