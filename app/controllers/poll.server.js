'use strict';

var Poll = require('../models/polls.js');

function PollStuff() {
    
    this.createPoll = function(req, res, next) {
        
        var newPoll = new Poll(req.body);
        newPoll.author = req.user.github.username;
        
        newPoll.save(function (err) {
        	if (err) {
        		return next(err);
        	}
        	
        	res.json(newPoll);
        });
    };
    
    this.getPolls = function(req, res, next) {
        Poll.find(function(err,polls){
            if (err) { return next(err); }
            
            res.json(polls);
        });
    };
}

module.exports = PollStuff;