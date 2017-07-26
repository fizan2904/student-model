var mongoose = require('mongoose');

var SubNoteSchema = mongoose.Schema({
	username : {
		type : String,
		required : true
	},
	dept : {
		type : String,
		required : true
	},
	year : {
		type : Number,
		required : true
	},
	subject : {
		type : String,
		required : true
	},
	topic_name : {
		type : String,
		required : true
	},
	path : {
		type : String,
		required : true
	}
});

var SubNotes = module.exports = mongoose.model('SubNotes', SubNoteSchema);

module.exports.findNotesByUsername = (username, cb) => {
	SubNotes.find({ username : username }, cb);
}

module.exports.saveNotes = (newNote, cb) => {
	newNote.save(cb);
}

module.exports.findNotesForStudent = (dept, year, cb) => {
	SubNotes.find({ $and : [{dept : dept}, {year:year}]}, cb);
}

module.exports.removeNote = (username, topic_name, cb) => {
	SubNotes.remove({ $and : [ {username : username}, { topic_name : topic_name }]},cb);
}

module.exports.getNotesByTopicnames = (username, topic, cb) => {
	SubNotes.findOne({ username : username, topic_name : topic }, cb);
}