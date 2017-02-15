'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Poll= new Schema({
	title: String,
	totResponses: {type: Number, default: 0},
	choices: [String],
	author: String,
	responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Response'}]
});

Poll.methods.respond = function(cb) {
    this.totResponses += 1;
    this.save(cb);
};

module.exports = mongoose.model('Poll', Poll);