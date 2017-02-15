'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Response = new Schema({
	choice: String,
	poll: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Poll'}]
});

module.exports = mongoose.model('Response', Response);