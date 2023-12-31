import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileList = ({dn, dp, email}) => {
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [counter, setCounter] = useState(0);
    const [file, setFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [droppedFileName, setDroppedFileName] = useState('DRAG AND DROP FILES HERE')
    const basePath = '/Users/Vishva/nas-server/' + email + '/MyDrive';
    const sharedPath = '/Users/Vishva/nas-server/' + email + '/Shared';
    const [localPath, setLocalPath] = useState('MyDrive')
    const IP_ADDRESS = 'localhost';
    const [isNotOnBase, setIsNotOnBase] = useState(false);
    const [isShareVisible, setIsShareVisible] = useState(false);
    const [shareEmail, setShareEmail] = useState('');
    const [sharedFile, setSharedFile] = useState('');
    const [isNotOnSharedPath, setIsNotOnSharedPath] = useState(true);

    const makeBasePath = async () => {
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/createFolder?path=' + basePath, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
            } else {
                console.error('Failed to create folder:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const makeSharedPath = async () => {
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/createFolder?path=' + sharedPath, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
            } else {
                console.error('Failed to create folder:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    makeBasePath();
    makeSharedPath();
    const [path, setPath] = useState(basePath);


    useEffect(() => {
    const fetchFiles = async (p) => {
        try {
            setPath(p);
            const response = await fetch('http://' + IP_ADDRESS + ':3001/getFiles?path=' + path);
            const data = await response.json();
            setFiles(data);
            let addLocal = p.split('/')[p.split('/').length - 1];
            if (p === basePath) {
                setLocalPath('My Drive');
            } else if (p === sharedPath) {
                setLocalPath('Shared Drive');
            } else {
                setLocalPath(localPath + ' > ' + addLocal);
            }
            console.log(files);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    fetchFiles(path);
    if (basePath === path) {
        setIsNotOnBase(false);
        setIsNotOnSharedPath(true);
        setLocalPath('My Drive');
    } else if (sharedPath === path) {
        setIsNotOnBase(false);
        setIsNotOnSharedPath(false);
        setLocalPath('Shared Drive');
    } else {
        setIsNotOnBase(true);
        setIsNotOnSharedPath(true);
    }
  }, [path, counter]);

    useEffect(() => {
    const fetchFolders = async (p) => {
        try {
            setPath(p);
            const response = await fetch('http://' + IP_ADDRESS + ':3001/getFolders?path=' + path);
            const data = await response.json();
            setFolders(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    fetchFolders(path);
    }, [path, counter]);

    const navigateBack = () => {
        const pathArray = path.split('/');
        pathArray.pop();
        const newPath = pathArray.join('/');
        setPath(newPath);
    };

    const downloadFile = async (f) => {
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/downloadFile?path=' + path + '/' + f);
            const blob = await response.blob();

            // Create a link and trigger the download
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = f; // Use the file name from the path
            link.click();
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const downloadFolder = async (fo) => {
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/downloadFolder?path=' + path + '/' + fo);
            const blob = await response.blob();

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fo + '.zip'; // Set a default name for the zip file
            link.click();
        } catch (error) {
            console.error('Error downloading folder:', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setDroppedFileName(e.target.files[0].name);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        setFile(e.dataTransfer.files[0]);
        console.log(file);
        setDroppedFileName(e.dataTransfer.files[0].name);
    };

    const uploadFile = async () => {
        console.log(file);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/uploadFile?path=' + path, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            console.log(data);
            setCounter(counter+1);
            setFile(null);
            setDroppedFileName('DRAG AND DROP FILES HERE');
            setIsPopupVisible(false);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const deleteFile = async (f) => {
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/deleteFile?path=' + path + '/' + f, {
            method: 'DELETE',
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
            } else {
                console.error('Failed to delete file:', response.statusText);
            }
            setCounter(counter+1);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const deleteFolder = async (fo) => {
        try {
          const response = await fetch('http://' + IP_ADDRESS + ':3001/deleteFolder?path=' + path + '/' + fo, {
            method: 'DELETE',
          });

          if (response.ok) {
            const data = await response.json();
            console.log(data.message);
          } else {
            console.error('Failed to delete path:', response.statusText);
          }
          setCounter(counter+1);
        } catch (error) {
          console.error('Error deleting path:', error);
        }
    };

    const handleFolderNameChange = (e) => {
        setFolderName(e.target.value);
    };

    const createFolder = async () => {
        try {
            const response = await fetch('http://' + IP_ADDRESS + ':3001/createFolder?path=' + path + '/' + folderName, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
            } else {
                console.error('Failed to create folder:', response.statusText);
            }
            setCounter(counter+1);
            setIsPopupVisible(false);
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const handleShare = async (f) => {
        setIsShareVisible(true);
        setSharedFile(f.name);
    };

    const shareFile = async (sourceFilePath) => {
        try {
            const response = await axios.post('http://localhost:3001/shareFile?sourceFilePath=' + path + '/' + sharedFile + '&destinationPath=' + '/Users/Vishva/nas-server/' + shareEmail + '/Shared');
    
            console.log(response.data.message); // Success message
            setIsShareVisible(false);
            setSharedFile('');
            setShareEmail('');
        } catch (error) {
            console.error('Error sharing file:', error.response.data.error);
        }
    };

    const handleShareEmailChange = (e) => {
        setShareEmail(e.target.value);
    }


    return (
        <html>
            <div class="nav">
                <div class="user">
                    <img class="user-picture" src={dp} alt={dn} />
                    <div class="user-info">
                        <div class="user-name">{dn}</div>
                    </div>
                </div>
                {isNotOnSharedPath && (
                <button class="initial-upload" onClick={() => setIsPopupVisible(true)}>
                    <img class="initial-upload-img" src="https://www.svgrepo.com/show/532994/plus.svg" alt="ADD"/>
                </button>)}
                <button class="home" onClick={() => setPath(basePath)}>
                    <img class="home-icon" src="https://www.svgrepo.com/show/22031/home-icon-silhouette.svg"/>
                </button>
                <button class="shared-drive" onClick={() => setPath(sharedPath)}>
                    <img class="share-nav-img" src="https://www.svgrepo.com/show/506316/share-1.svg" alt="SHARE"/>
                </button>
            </div>
            <div class="main"> 
            <div class="top-bar">
                <p class="local-path">{localPath}</p>
                {isNotOnBase? <button class="back" type="button" onClick={navigateBack}>BACK</button>:
                <div></div>}
            </div>
                <div class="directory">
                    {Array.isArray(folders) && folders.map((fo) => (
                        <div class="folders">
                            <div class="folder">
                                <p class="folder-name">{fo.name}</p>
                                <div class="operations">
                                    <p class="creation-date">{fo.createdAt.toLocaleString()}</p>
                                    <p class="size">{fo.size}</p>
                                    <button class="open" onClick={() => setPath(path + '/' + fo.name)}>
                                        <img class="open-img" src="https://www.svgrepo.com/show/510096/open-folder.svg" alt="OPEN"/>
                                    </button>
                                    <button class="download" type="button" onClick={() => downloadFolder(fo.name)}>
                                        <img class="download-img" src="https://www.svgrepo.com/show/510957/download.svg" alt="DOWNLOAD" />
                                    </button>
                                    <button class="delete" type="button" onClick={() => deleteFolder(fo.name)}>
                                        <img class="delete-img" src="https://www.svgrepo.com/show/533010/trash-alt.svg" alt="DELETE" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {Array.isArray(files) && files.map((f) => (
                        <div class="files">
                            <div class="file">
                                <p class="file-name">{f.name}</p>
                                <div class="operations">
                                    <p class="creation-date">{f.createdAt.toLocaleString()}</p>
                                    <p class="size">{f.size}</p>
                                    <button class="share-button" onClick={() => handleShare(f)}>
                                        <img class="share-img" src="https://www.svgrepo.com/show/506316/share-1.svg" alt="SHARE"/>
                                    </button>
                                    <button class="download" type="button" onClick={() => downloadFile(f.name)}>
                                        <img class="download-img" src="https://www.svgrepo.com/show/510957/download.svg" alt="DOWNLOAD" />
                                    </button>
                                    <button class="delete" type="button" onClick={() => deleteFile(f.name)}>
                                        <img class="delete-img" src="https://www.svgrepo.com/show/533010/trash-alt.svg" alt="DELETE" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div class="upload">
                    { isPopupVisible && (
                        <div class="upload-popup">
                            <div class="new-folder">
                                <input type="text" class="new-folder-input" placeholder="New Folder Name" onChange={handleFolderNameChange}/>
                                <button type="button" class="new-folder-button" onClick={createFolder}>ADD FOLDER</button>
                            </div>
                            <input type="file" class="file-upload" id="fileUpload" content="" hidden onChange={handleFileChange} />
                            <button class="browse" onClick={() => document.getElementById('fileUpload').click()}>
                                <div class="drop-area" onDragOver={handleDragOver} onDrop={handleDrop}>{droppedFileName}</div>
                            </button>
                            <div class="file-upload-buttons">
                                <button class="file-upload-button" onClick={uploadFile}>ADD FILE</button>
                                <button class="file-upload-close" onClick={() => setIsPopupVisible(false)}>CLOSE</button>
                            </div>
                        </div>
                    )}
                </div>
                <div class="share">
                    { isShareVisible && (
                        <div class="share-popup">
                            <input type="text" class="share-input" placeholder="name@gmail.com" onChange={handleShareEmailChange}/>
                            <div class="share-file-buttons">
                                <button type="button" class="share-file-button" onClick={() => shareFile()}>SHARE</button>
                                <button class="share-file-close" onClick={() => setIsShareVisible(false)}>CLOSE</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </html>
    );
};

export default FileList;
