var mongoose = require('mongoose');

var ExamSchema = mongoose.Schema({
	username : {
		type : String,
		required : true
	},
	exam_name : {
		type : String,
		required : true
	},
	questions : [{
		type : String,
		required : true
	}],
	options : [{
		optionA : {
			type : String,
			required : true
		},
		optionB : {
			type : String,
			required : true
		},
		optionC : {
			type : String,
			required : true
		},
		optionD : {
			type : String,
			required : true
		},
	}],
	answers : [{
		correct : {
			type : String,
			required : true
		},
		solution : {
			type : String,
			required : true
		}
	}],
	year : {
		type : Number,
		required : true
	},
	dept : {
		type : String,
		required : true
	},
	subject : {
		type : String,
		required : true
	},
	attempted : [String]

});

var Exam = module.exports = mongoose.model('Exam', ExamSchema);

module.exports.findExamsByUsername = (username, cb) => {
	Exam.find({ username : username }, cb);
}

module.exports.createExam = (newExam, cb) => {
	newExam.save(cb);
}

module.exports.findExamForStudent = (year, dept, cb) => {
	Exam.find({ $and : [ { year : year }, { dept : dept }]}, cb);
}

module.exports.updateAttempted = (attemptedUsername, subject, exam_name, year, dept, cb) => {
	Exam.find({ $and : [{subject : subject}, { exam_name : exam_name }, { year : year }, { dept : dept }]}, { $push : { attempted : attemptedUsername }}, cb);
}

module.exports.findExamForStudentSub = (subject, year, cb) => {
	Exam.find({ $and : [{subject : subject }, { year : year }]}, cb);
}

module.exports.findExamByExamname = (username , exam_name, year, dept, subject, cb) => {
	Exam.findOne({ username : username, exam_name : exam_name, year:year, dept : dept, subject : subject }, cb);
}

module.exports.isAttempted = (username, exam_name, student, year, cb) => {
	Exam.findOne({ $and : [{ username : username }, { exam_name : exam_name }, { year : year }, { attempted : student }]}, cb);
}

module.exports.attempted = (username, exam_name, student, year, cb) => {
	Exam.update({ $and : [{ username : username }, { exam_name : exam_name }, { year : year }]}, { $push : { attempted : student }}, cb);
}

module.exports.removeExam = (username, exam_name, cb) => {
	Exam.remove({ username : username, exam_name : exam_name }, cb);
}

module.exports.removeId = (id, cb) => {
	Exam.remove({ _id : id }, cb);
}