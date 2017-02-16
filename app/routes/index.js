'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var PollStuff = require(path + '/app/controllers/poll.server.js');
var mongoose = require('mongoose');
var Poll = mongoose.model('Poll');
var Response = mongoose.model('Response');

module.exports = function (app, passport) {

	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/');
		}
	}
	
	function isAuth (req, res) {
		if (req.isAuthenticated()) {
			return true;
		} else {
			return false;
		}
	}
	
	var clickHandler = new ClickHandler();
	var pollStuff = new PollStuff();

	app.route('/')
		.get(function(req, res){
			res.sendFile(path + '/public/index.html');
		});
	
	app.route('/loggedIn')
		.get(function(req, res){
			var auth = isAuth(req, res);
			if(auth){res.send(true)}
			else { res.send(false) }
		});
	
	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		
	app.route('/poll')
		.get(pollStuff.getPolls)
		.post(isLoggedIn, pollStuff.createPoll);
		
	app.route('/poll/:id')
		.get(function(req,res,next){
			var id = req.params.id;
			var query = Poll.findById(id);
    
		    query.exec(function(err, poll){
		        if(err) { return next(err); }
		        if(!poll) { return next(new Error('can\'t find poll')); }
		        
		        req.poll = poll;
		        
		        req.poll.populate('responses', function(err, poll){
		        if(err) {return next(err); }
		        
		        res.json(poll);
		    	});
		    });
		})
		.delete(function(req,res,next){
			Poll.findOneAndRemove({'_id' : req.params.id}, function (err,poll){
				if(err) {return next(err);}
				if(!poll) {return next(new Error('can\'t find poll'));}
				
		        res.json(poll);
		      });
		});
	
	app.route('/poll/:id/response')
		.post(function(req, res, next) {
			var id = req.params.id;
			var query = Poll.findById(id);
			
			query.exec(function(err, poll){
				if(err) { return next(err) }
				if(!poll) { return next(new Error('can\'t find poll')); }
				
				req.poll = poll;
			});
			
			var response= new Response(req.body);
			response.poll = req.poll;
			
			response.save(function(err, response){
				if(err) {return next(err); }
				
				req.poll.responses.push(response);
				req.poll.save(function(err, poll){
					if(err){ return next(err); }
					
					res.json(response);
				});
			});
		});
		
	app.route('/poll/:id/add/:choice')
		.post(function(req, res){
			Poll
				.findOneAndUpdate({'_id': req.params.id},{$push: {'choices':req.params.choice}})
				.exec(function(err,result){
					if(err) {throw err;}
					
					res.json(result.choices);
				});
		});
};
