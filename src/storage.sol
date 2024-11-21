// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct File {
        string name;
        string hash;
        uint256 size;
        address uploader;
    }

    mapping(uint256 => File) public files;
    uint256 public fileCount;

    event FileUploaded(uint256 fileId, string name, string hash, uint256 size, address uploader);

    function uploadFile(string memory _name, string memory _hash, uint256 _size) public {
        fileCount++;
        files[fileCount] = File(_name, _hash, _size, msg.sender);
        emit FileUploaded(fileCount, _name, _hash, _size, msg.sender);
    }

    function getFile(uint256 _fileId) public view returns (string memory, string memory, uint256, address) {
        File memory f = files[_fileId];
        return (f.name, f.hash, f.size, f.uploader);
    }
}