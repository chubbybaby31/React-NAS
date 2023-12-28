const express = require('express');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const cors = require('cors');
const archiver = require('archiver');
const multer = require('multer');
const AdmZip = require('adm-zip');

const app = express();
const port = 3001;

app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log(req.query.path);
        cb(null, req.query.path);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

app.get('/getFiles', (req, res) => {
  const directoryPath = req.query.path || __dirname; // Change this to the path of the directory you want to list
  console.log(directoryPath);
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }

    const results = fs.readdirSync(directoryPath);
      const fileDetails = results.filter(res => fs.lstatSync(path.resolve(directoryPath, res)).isFile())
    console.log("sending")
    res.json(fileDetails);
  });
});

app.get('/getFolders', (req, res) => {
    const directoryPath = req.query.path || __dirname; // Change this to the path of the directory you want to list
  
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read directory' });
      }
  
      const results = fs.readdirSync(directoryPath);
      const fileDetails = results.filter(res => fs.lstatSync(path.resolve(directoryPath, res)).isDirectory())
      console.log("sending")
      res.json(fileDetails);
    });
});

app.get('/downloadFile', (req, res)=> {
    const filePath = req.query.path;

    if (!filePath) {
        return res.status(400).json({ error: 'File path not provided' });
    }
    console.log(filePath);
    res.download(filePath);
});

app.get('/downloadFolder', (req, res)=> {
    const folderPath = req.query.path;

    if (!folderPath) {
        return res.status(400).json({ error: 'Folder path not provided' });
    }

    const output = fs.createWriteStream('folder.zip');
    const archive = archiver('zip', {
        zlib: { level: 9 }, // Set compression level
    });

    output.on('close', () => {
        res.download('folder.zip');
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
});

const upload = multer({ storage: storage });

app.post('/uploadFile', upload.single('file'), (req, res) => {
    res.json({ message: 'File uploaded successfully!' });
});

app.delete('/deleteFile', async (req, res) => {
    const filePath = req.query.path;
    console.log(filePath)
    if (!filePath) {
        return res.status(400).json({ error: 'File path not provided' });
    }
  
    try {
        await fsPromises.unlink(filePath);
        res.json({ message: 'File deleted successfully!' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/deleteFolder', async (req, res) => {
    const deletePath = req.query.path;
  
    if (!deletePath) {
        return res.status(400).json({ error: 'Path not provided' });
    }
  
    try {
        await fsPromises.rmdir(deletePath, { recursive: true }); // recursive: true deletes directories and their contents
        res.json({ message: 'Path deleted successfully!' });
    } catch (error) {
        console.error('Error deleting path:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/createFolder', async (req, res) => {
    const folderPath = req.query.path;
  
    if (!folderPath) {
      return res.status(400).json({ error: 'Folder path not provided' });
    }
  
    try {
      await fsPromises.mkdir(folderPath, { recursive: true });
      res.json({ message: 'Folder created successfully!' });
    } catch (error) {
      console.error('Error creating folder:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
