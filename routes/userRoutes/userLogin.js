var router = require('express').Router(),
	User = require('../../models/user'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('error_msg', 'Please login to continue');
		res.redirect('/login');
	}
}

passport.use(new LocalStrategy((username, password, done) => {
	User.getUserByUsername(username, (err, user) => {
		if(err){
			throw err;
		}else if(!user){
			return done(null, false, { message : 'Credentials don\'t match' });
		}else{
			User.comparePassword(password, user.password, (err, isMatch) => {
				if(err){
					throw err;
				}else if(isMatch){
					return done(null, user, { message : 'Success'});
				}else{
					return done(null, false, { message : 'Credentials don\'t match' });
				}
			});
		}
	});
}));

passport.serializeUser((user, done) => {
	if(user.teacher){
		var sessionUser = {
			_id : user._id,
			username : user.username,
			teacher : user.teacher
		}
		done(null, sessionUser);
	}else{
		var sessionUser = {
			_id : user._id,
			username : user.username,
			teacher : user.teacher,
			year : user.year,
			dept : user.dept
		}
		done(null, sessionUser);
	}
});

passport.deserializeUser((id, done) => {
	User.getUserById(id, (err, sessionUser) => {
		done(err, sessionUser);
	});
});

router.post('/',
	passport.authenticate(
		'local',{
			successRedirect:'/dashboard',
			failureRedirect:'/login',
			failureFlash: true
		}
	), (req, res) => {
		res.redirect('/');
	}
);

router.get('/', (req, res) => {
	if(req.isAuthenticated()){
		res.redirect('/dashboard');
	}else{
		res.render('login.html',{ messages: req.flash('error_msg') });
	}
});

router.get('/logout', ensureAuth, (req, res) => {
	req.logout();
	req.flash("success_msg", "Successfully logged out");
	res.redirect('/login');
});

module.exports = router;