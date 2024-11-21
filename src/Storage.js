import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // State to hold uploaded files
  const [windowHeight, setWindowHeight] = useState(window.innerHeight); // State to store window height
  const [viewFiles, setViewFiles] = useState(false); // State to toggle file view
  const [uploadingFileName, setUploadingFileName] = useState(''); // State to hold uploading file name

  const web3 = new Web3(window.ethereum); // Initialize Web3 with the Ethereum provider from MetaMask

  const contractAddress = "0x4793d9304f6f81c000fbab1f95ec099d65b9a048"; // Your smart contract address
  const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "fileId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "hash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "size",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "uploader",
          "type": "address"
        }
      ],
      "name": "FileUploaded",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "fileCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "files",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "hash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "size",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "uploader",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_fileId",
          "type": "uint256"
        }
      ],
      "name": "getFile",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_hash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_size",
          "type": "uint256"
        }
      ],
      "name": "uploadFile",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Fetch uploaded files
  const fetchUploadedFiles = async () => {
    try {
      const fileCount = await contract.methods.fileCount().call();
      const files = [];
      for (let i = 0; i < fileCount; i++) {
        const file = await contract.methods.files(i).call();
        files.push(file);
      }

      // Reverse the order of the files and limit to the last 3
      const latestFiles = files.reverse().slice(0, 3);

      // Set the state with the latest 3 files
      setUploadedFiles(latestFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    // Fetch the uploaded files when component mounts or file is uploaded
    fetchUploadedFiles();

    // Handle window resize event
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [file]); // Re-fetch files when a new file is uploaded

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadingFileName(event.target.files[0].name); // Set file name for the uploading state
  };

  const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a file first.");
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(file);
    fileReader.onloadend = async () => {
      const fileData = fileReader.result;
      const uint8Array = new Uint8Array(fileData); // Convert ArrayBuffer to Uint8Array
      const fileHash = web3.utils.sha3(uint8Array); // Hash the file data using Web3
      const fileSize = file.size;
      const fileName = file.name;

      // Add the uploading file to the list of files immediately
      const newFile = {
        name: fileName,
        hash: fileHash,
        size: fileSize,
        uploader: "Pending",
      };

      // Temporarily add the file to the state
      setUploadedFiles([newFile, ...uploadedFiles]);

      try {
        // Request accounts from MetaMask (using the new method)
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        // Call the smart contract to upload the file
        const tx = await contract.methods.uploadFile(fileName, fileHash, fileSize).send({
          from: account,
          gas: 2000000
        });

        toast.success("File uploaded successfully!");
        toast.info(`Transaction Hash: ${tx.transactionHash}`);

        // Clear the file input and fetch the updated list of files
        setFile(null); // Clear file input
        setUploadingFileName(''); // Clear the uploading file name
        fetchUploadedFiles(); // Fetch and update files after upload
      } catch (err) {
        toast.error("Error uploading file: " + err.message);
        setUploadingFileName(''); // Clear the uploading file name on error
      }
    };
  };

  return (
    <div>
      <h2>Upload File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload</button>

      {/* Show uploading file message if there's an ongoing upload */}
      {uploadingFileName && (
        <div style={{ padding: '10px', marginTop: '10px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
          <strong>Uploading:</strong> {uploadingFileName}
        </div>
      )}

      {/* Button to toggle the view of uploaded files */}
      <button onClick={() => setViewFiles(!viewFiles)}>
        {viewFiles ? "Hide Uploaded Files" : "View Uploaded Files"}
      </button>

      {viewFiles && (
        <div
          style={{
            maxHeight: windowHeight * 0.4, // 40% of the window height
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: '10px',
            marginTop: '10px',
            marginBottom: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
          }}
        >
          <h3>Uploaded Files</h3>
          <ul>
            {uploadedFiles.length > 0 ? (
              uploadedFiles.map((file, index) => (
                <li key={index} style={{ color: 'black' }}> {/* Ensure the text is black */}
                  <p><strong>File Name:</strong> {file.name}</p>
                  <p><strong>File Hash:</strong> {file.hash}</p>
                  <p><strong>Size:</strong> {web3.utils.fromWei(file.size, 'ether')} ETH</p>
                  <p><strong>Uploader:</strong> {file.uploader}</p>
                </li>
              ))
            ) : (
              <p>No files uploaded yet.</p>
            )}
          </ul>
        </div>
      )}

      {/* Toast Container to display notifications */}
      <ToastContainer />
    </div>
  );
};

export default FileUpload;