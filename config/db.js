var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : 'localhost',
        user     : 'spark',
        password : 'spark',
        database : 'spark',
        charset  : 'UTF8_GENERAL_CI'
    }
});

var bookshelf = require('bookshelf')(knex);

module.exports.bookshelf = bookshelf;