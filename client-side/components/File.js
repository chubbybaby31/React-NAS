import React, { useState, useEffect } from 'react';

const FileList = ({dn, dp, email}) => {
    const [files, setFiles] = useState([]);
    const [folders, setFolders] = useState([]);
    const [counter, setCounter] = useState(0);
    const [file, setFile] = useState(null);
    const [folderName, setFolderName] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [droppedFileName, setDroppedFileName] = useState('DRAG AND DROP FILES HERE')
    const basePath = '/Users/Vishva/nas-server/' + email;
    const [localPath, setLocalPath] = useState('MyDrive')
    const [isNotOnBase, setIsNotOnBase] = useState(false);
    const [optionsDropDown, setOptionsDropDown] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const IP_ADDRESS = 'localhost';

    const makeBasePath = async () => {
        try {
            const response = await fetch(`http://` + IP_ADDRESS + `:3001/createFolder?path=` + basePath, {
                method: 'POST',
            });
      
            if (response.ok) {
                const data = await response.json();
                console.log(data.message);
            } else {
                console.error('Failed to create folder:', response.statusText);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    makeBasePath();
    const [path, setPath] = useState(basePath);


    useEffect(() => {
    const fetchFiles = async (p) => {
        try {
            setPath(p);
            const response = await fetch('http://' + IP_ADDRESS + ':3001/getFiles?path=' + path);
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };


    fetchFiles(path);
    if (basePath === path) {
        setIsNotOnBase(false);
    } else {
        setIsNotOnBase(true);
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

        const localPathArray = localPath.split(' > ');
        localPathArray.pop();
        setLocalPath(localPathArray.join(' > '));
    };

    const downloadFile = async (f) => {
        try {
            const response = await fetch(`http://` + IP_ADDRESS + `:3001/downloadFile?path=` + path + '/' + f);
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
            const response = await fetch(`http://` + IP_ADDRESS + `:3001/downloadFolder?path=` + path + '/' + fo);
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
            const response = await fetch(`http://` + IP_ADDRESS + `:3001/deleteFile?path=` + path + '/' + f, {
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
          const response = await fetch(`http://` + IP_ADDRESS + `:3001/deleteFolder?path=` + path + '/' + fo, {
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
            const response = await fetch(`http://` + IP_ADDRESS + `:3001/createFolder?path=` + path + '/' + folderName, {
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

    const handleOptionsClick = (f) => {
        setOptionsDropDown(true);
        setSelectedFile(f);
    };

    const handleMouseEnter = (f) => {
        setOptionsDropDown(true);
        setSelectedFile(f);
    };

    const handleMouseLeave = () => {
        setOptionsDropDown(false);
        setSelectedFile();
    };

    return (
        <html>
            <div class="nav">
                <div class="user">
                    <img class="user-picture" src={dp} alt={dn} />
                    <div class="user-info">
                        <div class="user-name">{dn}</div>
                    </div>
                </div>
                <button class="initial-upload" onClick={() => setIsPopupVisible(true)}>+</button>
                <button class="home" onClick={() => setPath(basePath)}>
                    <img class="home-icon" src="https://www.svgrepo.com/show/22031/home-icon-silhouette.svg"/>
                </button>
            </div>
            <div class="main"> 
                {isNotOnBase? <button class="back" type="button" onClick={navigateBack}>BACK</button>:
                <div></div>}
                <div class="directory">
                    {folders.map((fo) => (
                        <div class="folders">
                            <div class="card folder" onMouseEnter={() => handleMouseEnter(fo)} onMouseLeave={() => handleMouseLeave()} onClick={() => setPath(path + '/' + fo)}>
                                <div class="visible">
                                    <p class="folder-name">{fo}</p>
                                </div>
                                {optionsDropDown && selectedFile === fo && (
                                    <div class="operations">         
                                        <button class="download" type="button" onClick={() => downloadFolder(fo)}>
                                            <img class="download-img" src="https://www.svgrepo.com/show/510957/download.svg" alt="DOWNLOAD" />
                                        </button>
                                        <button class="delete" type="button" onClick={() => deleteFolder(fo)}>
                                            <img class="delete-img" src="https://www.svgrepo.com/show/533010/trash-alt.svg" alt="DELETE" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {files.map((f) => (
                        <div class="files">
                            <div class="card file" onMouseEnter={() => handleMouseEnter(f)} onMouseLeave={() => handleMouseLeave()}>
                                <div class="visible">
                                    <p class="file-name">{f}</p>
                                </div>
                                {optionsDropDown && selectedFile === f && (
                                    <div class="operations">          
                                        <button class="download" type="button" onClick={() => downloadFile(f)}>
                                            <img class="download-img" src="https://www.svgrepo.com/show/510957/download.svg" alt="DOWNLOAD" />
                                        </button>
                                        <button class="delete" type="button" onClick={() => deleteFile(f)}>
                                            <img class="delete-img" src="https://www.svgrepo.com/show/533010/trash-alt.svg" alt="DELETE" />
                                        </button>
                                    </div>
                                )}
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
            </div>
        </html>
    );
};

export default FileList;
