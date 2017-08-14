const json2csv = require('json2csv');

const exportLetterboxd = (data, filter) => {
    let fields = [];

    data = JSON.parse(JSON.stringify(data).split('"originalTitle":').join('"Title":').split('"year":').join('"Year":').split('"directors":').join('"Directors":').split('"rating":').join('"Rating10":'));

    for(let i = 0; i < data.length; i++) {
      data[i].Directors = data[i].Directors.join(", ");

      delete data[i].frenchTitle;

      if (filter === 'wish') {
          delete data[i].Rating10;
      }
    }

    if (filter === 'done') {
        fields = ['Title', 'Year', 'Directors', 'Rating10']
    } else if (filter === 'wish') {
        fields = ['Title', 'Year', 'Directors']
    }

    return json2csv({ data, fields });
}

module.exports = {
    exportLetterboxd
}
