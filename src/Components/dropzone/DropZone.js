// THANKS TO Uzochukwu Eddie Odozi FOR THIS TUTORIAL! 
// https://blog.logrocket.com/create-a-drag-and-drop-component-with-react-dropzone/



import React, {useState, useRef} from 'react';
import './dropzone.css';

const DropZone = (props) => {

    let [selectedFile, setSelectedFile] = useState('');
    let [errorMessage, setErrorMessage] = useState('');
    const fileInputRef = useRef();
    const modalRef = useRef();
    const modalImageRef = useRef();

    const dragOver = (e) => {
        e.preventDefault();
    }

    const dragEnter = (e) => {
        e.preventDefault();
    }

    const dragLeave = (e) => {
        e.preventDefault();
    }

    const fileDrop = (e) => {
        e.preventDefault();

        const files = e.dataTransfer.files;

        if (files.length){
            handleFiles(files[files.length - 1]);
        }
    }

    const handleFiles = (file) => {

        if (validateFile(file)){
            console.log('valid file');
        } else {
            file['invalid'] = true;
            // set error message
            setErrorMessage('File type not permitted');
            console.log('invalid');
        }

        setSelectedFile(file);
        props.handleImageChange(file);
    }

    const validateFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/x-icon'];
        if (validTypes.indexOf(file.type) === -1) {
            return false;
        }
        return true;
    }

    const fileSize = (size) => {
        if (size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const fileType = (fileName) => {
        if (fileName){
            return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
        }
    }

    const openImageModal = (file) => {
        const reader = new FileReader();
        modalRef.current.style.display = 'block';
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            modalImageRef.current.style.backgroundImage = `url(${e.target.result})`
        }
    }

    const closeModal = () => {
        modalRef.current.style.display = "none";
        modalImageRef.current.style.backgroundImage = 'none';
    }

    const fileInputClicked = () => {
        fileInputRef.current.click();
    }

    const fileSelected = () => {
        if (fileInputRef.current.files.length) {
            handleFiles(fileInputRef.current.files[0]);
        }
    }

    return (
        <div className="center cont">
            <div
                className="drop-container"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
                onClick={fileInputClicked}>
                <div className="drop-message">
                <input
                    ref={fileInputRef}
                    className="file-input"
                    type="file"
                    onChange={fileSelected}
                />
                    <div className="upload-icon"></div>
                    Drag & Drop your image Here.
                </div>
            </div>

            <div className="d-modal" ref={modalRef}>
                <div className="d-overlay"></div>
                <div className="close" onClick={closeModal}>X</div>
                <div className="modal-image" ref={modalImageRef}></div>
            </div>

            <div className={`file-display-container ${selectedFile === '' ? 'hide' : ''}`}>
                <div className="file-status-bar" onClick={() => {openImageModal(selectedFile)}}>
                    <div>
                        <div className="file-type-logo"></div>
                        <div className="file-type">{fileType(selectedFile.name)}</div>
                        <span className="file-name">{selectedFile.name}</span>
                        <span className="file-size">({fileSize(selectedFile.size)})</span> {selectedFile.invalid && <span className='file-error-message'>({errorMessage})</span>}
                    </div>
                    <div className="file-remove" onClick={() => {setSelectedFile('')}}>X</div>
                </div>
            </div>
        </div>
    )
}

export default DropZone;