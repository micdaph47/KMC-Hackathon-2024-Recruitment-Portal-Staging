const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/recruitment', { useNewUrlParser: true, useUnifiedTopology: true });

const applicantSchema = new mongoose.Schema({
    name: String,
    resumePath: String,
    resumeText: String
});

const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;
