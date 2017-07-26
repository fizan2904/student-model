var mongoose = require('mongoose');

var ScoreSchema = mongoose.Schema({
	exam_conducted_by : {
		type : String,
		required : true
	},
	username : {
		type : String,
		requried : true
	},
	subject : {
		type : String,
		required : true
	},
	year : {
		type : Number,
		required : true
	},
	dept : {
		type : String,
		required : true
	},
	section : {
		type : String,
		required : true
	},
	score : {
		type : Number,
		required : true
	},
	exam_name : {
		type : String,
		required : true
	},
	ans : [{
		given : String,
		crct : String
	}]
});

var Score = module.exports = mongoose.model('Score', ScoreSchema);

/*module.exports = {

	getScoreByExamname : (username, exam_name, cb) => {
		Score.findOne({ username : username, exam_name : exam_name }, cb);
	},

	addScore : (newScore, cb) => {
		newScore.save(cb);
	},

	getScoreByUsername : (username, cb) => {
		Score.find({ username : username }, cb);
	}

}*/

module.exports.addScore = (newScore, cb) => {
	newScore.save(cb);
}

module.exports.getScores = (username, exam_name, cb) => {
	Score.findOne({ username : username, exam_name : exam_name }, cb);
}

module.exports.getScoresByExamname = (exam_name, cb) => {
	Score.find({ exam_name : exam_name }, cb);
}

module.exports.getScoreBySubject = (subject, year, dept, section, cb) => {
	Score.find({ subject : subject, year : year, dept : dept, section : section }, cb);
}

module.exports.teacherScores = (exam_conducted_by, year, dept, subject, cb) => {
	Score.find({ exam_conducted_by : exam_conducted_by, year : year, dept : dept, subject : subject }, cb);
}