var router = require('express').Router(),
	multer = require('multer'),
	Temp = require('../../models/temp_db'),
	User = require('../../models/user'),
	path = require('path'),
	Notes = require('../../models/teachSubNotes'),
	date = Date.now(),
	fs = require('fs-extra'),
	storage = multer.diskStorage({
		destination: function (req, file, cb) {
    		cb(null, path.join(__dirname, '../../notes'));
  		},
  		filename: function (req, file, cb) {
  			var mime = file.mimetype.split("/");
    		cb(null, file.fieldname + "." + mime[mime.length-1]);
  		}
	}),
	upload = multer({ storage: storage });

var ensureAuth = (req, res, next) => {
	if(req.isAuthenticated()){
		return next();
	}else{
		res.redirect('/login');
	}
}

router.get('/upload', ensureAuth, (req, res) => {
	res.render('upload_notes.html');
});

router.post('/upload', ensureAuth, upload.any(), (req, res) => {
	var teacher = req.session.passport.user.teacher,
		username = req.session.passport.user.username;
	if(teacher){
		var subject = req.body.subject,
			dept = req.body.dept,
			topic = req.body.topic,
			year = req.body.year;
		var newNote = new Notes({
			username : req.session.passport.user.username,
			dept : dept,
			year : year,
			subject : subject,
			topic_name : topic,
			path : req.files[0].path
		});
		Notes.getNotesByTopicnames(username, topic, (err, topics) => {
			if(topics){
				req.flash('error_msg', 'Topic name already in use');
				res.redirect('/notes/upload');
			}else{
				Notes.saveNotes(newNote, (err) => {
					if(err) throw err;
					res.redirect("/notes");
				});
			}
		});
	}else{
		res.redirect('/dashboard');
	}
});

router.get('/', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username;
	if(req.session.passport.user.teacher){
		Notes.findNotesByUsername(username, (err, docs) => {
			if(err) throw err;
			for(var i=0;i<docs.length;i++){
				var newPath = docs[i].path;
				newPath = newPath.split('/');
				newPath = newPath[newPath.length-1];
				newPath = '/'+newPath;
				docs[i].path = newPath;
			}
			res.render('notes.html', { docs : docs, teacher : true });
		});
	}else{
		User.getUserByUsername(username, (err, user) => {
			Notes.findNotesForStudent(user.dept, user.year, (err, docs) => {
				if(err) throw err;
				for(var i=0;i<docs.length;i++){
					var newPath = docs[i].path;
					newPath = newPath.split('/');
					newPath = newPath[newPath.length-1];
					newPath = '/'+newPath;
					docs[i].path = newPath;
				}
				res.render('notes.html', { docs : docs, teacher : false });
			});
		});
	}
	
});

router.get('/remove/:topic_name', ensureAuth, (req, res) => {
	var username = req.session.passport.user.username,
		topic_name = req.params.topic_name;
	Notes.getNotesByTopicnames(username, topic_name, (err, note) => {
		if(err) throw err;
		var dept = note.dept,
			year = note.year,
			path = note.path,
			subject = note.subject;
		fs.remove(note.path, err => {
			if(err) throw err;
			Notes.removeNote(username, topic_name, (err) => {
				if(err) throw err;
				res.redirect("/notes");
			});
		});
	});
	
});

module.exports = router;