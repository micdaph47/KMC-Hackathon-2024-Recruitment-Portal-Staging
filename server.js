const express = require('express');
const multer = require('multer');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
require('dotenv').config();
const app = express();
const upload = multer({ dest: 'uploads/' });
const Applicant = require('./db');

async function validateApplicant(name) {
    const apiKey = process.env.EDENAI_API_KEY;
    const response = await axios.post('https://api.edenai.co/v1/validate', { name: name }, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return response.data.valid;
}

async function extractTextFromPDF(filePath) {
    const dataBuffer = await fs.promises.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
}

async function extractTextFromDoc(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
}

app.post('/submit-application', upload.single('resume'), async (req, res) => {
    const applicantName = req.body.name;
    const resume = req.file;
    
    const isValid = await validateApplicant(applicantName);
    if (!isValid) {
        return res.status(400).send('Invalid applicant information.');
    }

    let resumeText = '';
    if (resume.mimetype === 'application/pdf') {
        resumeText = await extractTextFromPDF(resume.path);
    } else if (resume.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        resumeText = await extractTextFromDoc(resume.path);
    }

    const newApplicant = new Applicant({ name: applicantName, resumePath: resume.path, resumeText });
    await newApplicant.save();
    res.send(`Application submitted by ${applicantName}`);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
