var mongoose = require('mongoose');

var TempSchema = mongoose.Schema({
	username : {
		type : String,
		required : true
	},
	no_of_que : {
		type : Number,
		required : true
	},
	exam_name : {
		type : String,
		required : true
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
	}
});

var Temp = module.exports = mongoose.model('Temp', TempSchema);

module.exports.createTemp = (newTemp, cb) => {
	newTemp.save(cb);
}

module.exports.removeTemp = (username, exam_name, subject, year, dept, cb) => {
	Temp.remove({ $and : [{ username : username }, { exam_name : exam_name }, { subject : subject }, { year : year }, { dept : dept}]}, cb);
}

module.exports.findTempByUsername = (username, cb) => {
	Temp.findOne({ username : username }, cb);
}