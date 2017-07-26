var router = require('express').Router(),
	User = require('../../models/user');

router.route('/')

	.get((req, res) => {
		if(req.isAuthenticated()){
			res.redirect('/dashboard');
		}else{
			res.render('register.html');
		}
	})

	.post((req, res) => {
		if(req.isAuthenticated()){
			res.redirect('/dashboard');
		}else{
			if(req.body.teacher == "false"){
				var teacher = false,
					firstname = req.body.s_first,
					lastname = req.body.s_last,
					email = req.body.s_email,
					dept = req.body.s_dept,
					year = req.body.s_year,
					sec = req.body.s_sec,
					username = req.body.s_username,
					reg_no = req.body.s_regid,
					password = req.body.s_pwd,
					password1 = req.body.s_pwd1
			}else{
				var teacher = true,
					firstname = req.body.t_first,
					lastname = req.body.t_last,
					email = req.body.t_email,
					dept = req.body.t_dept,
					username = req.body.t_username,
					reg_no = req.body.t_regid,
					password = req.body.t_pwd,
					password1 = req.body.t_pwd1
			}
			if(teacher == false){
				req.checkBody('s_year', 'Year is required').notEmpty();
				req.checkBody('s_sec', 'Section is required').notEmpty();
				req.checkBody('s_username', 'Username is required').notEmpty();
				req.checkBody('s_first', 'First Name is required').notEmpty();
				req.checkBody('s_last', 'Last Name is required').notEmpty();
				req.checkBody('s_pwd', 'Password is required').notEmpty();
				req.checkBody('s_pwd1', 'Passwords do not match').equals(password);
				req.checkBody('s_dept', 'Deparment is required').notEmpty();
				req.checkBody('s_regid', 'Register Number is required').notEmpty();
			}else{
				req.checkBody('t_username', 'Username is required').notEmpty();
				req.checkBody('t_first', 'First Name is required').notEmpty();
				req.checkBody('t_last', 'Last Name is required').notEmpty();
				req.checkBody('t_pwd', 'Password is required').notEmpty();
				req.checkBody('t_pwd1', 'Passwords do not match').equals(password);
				req.checkBody('t_dept', 'Deparment is required').notEmpty();
				req.checkBody('t_regid', 'Register Number is required').notEmpty();
			}

			var errors = req.validationErrors();
			if(errors){
				console.log(errors);
				var messages = [];
				for(var i=0;i<errors.length;i++){
					messages.push(errors[i].msg);
				}
				var msg = "";
				for(var i=0;i<messages.length;i++){
					msg += messages[i]+"<br>";
				}
				console.log(msg);
				req.flash('error_msg', messages);
				res.redirect('/register');
			}else{
				if(teacher){
				var newUser = new User({
					username : username,
					reg_no : reg_no,
					password : password,
					teacher : teacher,
					firstname : firstname,
					lastname : lastname,
					dept : dept,
					email : email
				});
			}else{
				var newUser = new User({
					username : username,
					reg_no : reg_no,
					password : password,
					teacher : teacher,
					section : sec,
					year : year,
					firstname : firstname,
					lastname : lastname,
					dept : dept,
					email : email
				});
			}
			User.getUserByUsername(username, (err, users) => {
				if(users){
					res.send("Username already in use");
				}else{
					User.getUserByReg(reg_no, (err, regs) => {
						if(regs){
							res.send("Register Number already in use");
						}else{
							User.getUserByEmail(email, (err, mails) => {
								if(mails){
									res.send("Email already in use");
								}else{
									User.createUser(newUser, (err) => {
										if(err) throw err;
										req.flash('success_msg', 'User successfully registered');
										res.redirect('/dashboard');
									});
								}
							});
						}
					});
				}
			});
			
			}
		}
	})

	.all((req, res) => {
		res.send("404 Error");
	})

module.exports = router;