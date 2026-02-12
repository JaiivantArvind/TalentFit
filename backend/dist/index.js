"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const parsePdf = require('pdf-parse');
const mammoth_1 = __importDefault(require("mammoth"));
const resumeAnalyzer_1 = require("./services/resumeAnalyzer");
console.log('Backend: All imports loaded.');
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
console.log('Backend: Express app and port defined.');
// Set up multer for file uploads
console.log('Backend: Setting up multer storage.');
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Ensure the uploads directory exists
        const uploadDir = 'uploads/';
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Files will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
console.log('Backend: Multer setup complete.');
app.use((0, cors_1.default)());
app.use(express_1.default.json());
console.log('Backend: Middleware (CORS, JSON) applied.');
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/upload', upload.single('resume'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const filePath = req.file.path;
    let extractedText = null;
    try {
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const data = yield parsePdf(dataBuffer);
            extractedText = data.text;
        }
        else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = yield mammoth_1.default.extractRawText({ path: filePath });
            extractedText = value;
        }
        else if (req.file.mimetype === 'text/plain') {
            extractedText = fs_1.default.readFileSync(filePath, 'utf8');
        }
        else {
            return res.status(400).send('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
        }
        if (!extractedText) {
            return res.status(500).send('Could not extract text from the resume.');
        }
        const analysisResult = (0, resumeAnalyzer_1.analyzeResume)(extractedText);
        res.send({
            message: 'File uploaded, parsed, and analyzed successfully',
            filename: req.file.filename,
            extractedText: extractedText,
            analysisResult: analysisResult,
        });
    }
    catch (error) {
        console.error('Error processing resume:', error);
        res.status(500).send('Error processing resume.');
    }
    finally {
        // Clean up: delete the uploaded file
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting uploaded file:', err);
            }
        });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
