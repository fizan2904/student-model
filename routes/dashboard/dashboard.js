var router = require('express').Router(),
	Notes = require('../../models/teachSubNotes'),
	Exam = require('../../models/exam'),
	User = require('../../models/user');

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		req.flash('Error_msg', 'Please login to continue');
		res.redirect('/login');
	}
}

router.route('/')

	.get(ensureAuth, (req, res) => {
		var teacher = req.session.passport.user.teacher,
			username = req.session.passport.user.username;
		if(teacher){
			User.getUserByUsername(username, (err, docs) => {
				if(err) throw err;
				if(!docs){
					req.flash('No details available');
					res.redirect('/login');
				}else{
					Notes.findNotesByUsername(username, (err, notes) => {
						if(err) throw err;
						Exam.findExamsByUsername(username, (err, exams) => {
							if(err) throw err;
							res.render('teacher_dash.html', { userData : docs, notes : notes, exams : exams });
						});
					});
					
				}
			});
		}else{
			User.getUserByUsername(username, (err, docs) => {
				if(err) throw err;
				if(!docs){
					req.flash('No details available');
					res.redirect('/login');
				}else{
					Notes.findNotesForStudent(docs.dept, docs.year, (err, notes) => {
						if(err) throw err;
						Exam.findExamForStudent(docs.year, docs.dept, (err, exams) => {
							if(err) throw err;
							res.render('student_dash.html', { userData : docs, notes : notes, exams : exams });
						});
					});
				}
			});
		}
	})

	.all((req, res) => {
		res.send('404 Not Found');
	});

module.exports = router;