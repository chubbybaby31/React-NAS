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

function formatSize(size) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
  }
  return `${size.toFixed(2)} ${units[i]}`;
}

app.get('/getFiles', (req, res) => {
  const path = req.query.path;

  // Use fs.readdir to get the list of files/folders
  fs.readdir(path, (err, items) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading directory' });
      }
      try {
        const fileDetails = items.filter((item) => fs.statSync(`${path}/${item}`).isFile()).map((file) => {
                const stats = fs.statSync(`${path}/${file}`);
                const formattedDate = stats.birthtime.toISOString().split('T')[0];
                return {
                    name: file,
                    size: formatSize(stats.size), // Size in bytes
                    createdAt: formattedDate, // Creation date
                };
        });
        res.json(fileDetails);
      } catch (error) {
        res.json([]);
      }

  });
});

app.get('/getFolders', (req, res) => {
  const path = req.query.path;

  // Use fs.readdir to get the list of files/folders
  fs.readdir(path, (err, items) => {
      if (err) {
          return res.status(500).json({ error: 'Error reading directory' });
      }
      try{
      const fileDetails = items.filter((item) => fs.statSync(`${path}/${item}`).isDirectory()).map((file) => {
            const stats = fs.statSync(`${path}/${file}`);
            const formattedDate = stats.birthtime.toISOString().split('T')[0];
            

            return {
              name: file,
              size: formatSize(stats.size), // Size in bytes
              createdAt: formattedDate, // Creation date
            };
          });
          res.json(fileDetails);
        } catch (error) {
          res.json([]);
        }

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
        await fsPromises.rm(deletePath, { recursive: true }); // recursive: true deletes directories and their contents
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

  app.post('/shareFile', async (req, res) => {
    try {
        const { sourceFilePath, destinationPath } = req.query;

        // Validate and process the parameters
        if (!sourceFilePath || !destinationPath) {
            return res.status(400).json({ error: 'Invalid parameters' });
        }

        // Check if the source file exists
        if (!fs.existsSync(sourceFilePath)) {
            return res.status(404).json({ error: 'Source file not found' });
        }

        // Create a symbolic link to the source file in the destination path
        const destinationFile = path.join(destinationPath, path.basename(sourceFilePath));
        fs.symlinkSync(sourceFilePath, destinationFile);

        res.json({ message: 'File shared successfully' });
    } catch (error) {
        console.error('Error sharing file:', error);
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
