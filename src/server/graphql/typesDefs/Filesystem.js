import { gql } from "apollo-server-express";

/**
 * @typedef {Object} File
 * @property {string} id - The UUID assigned to the file.
 * @property {string} label - The label for the file. Usually the file name without the path.
 * @property {string} path - Full path to the file in the data store.
 * @property {string} permission - The maximum permission level on the file for the user. One of "read", "write", or "own".
 * @property {number} dateCreated - File creation date as milliseconds since the epoch.
 * @property {number} dateModified - Last modified date as milliseconds since the epoch.
 * @property {string} type - Either "file" or "folder". Should be "file".
 * @property {number} shareCount - The number of users the file has been shared with.
 * @property {string} infoType - The info type of the file.
 * @property {string} md5 - The MD5 hash of the file.
 * @property {fileSize} number - The size of the file in bytes.
 * @
 */

/**
 * @typedef {Object} Folder
 * @property {string} id - The UUID assigned to the folder.
 * @property {string} label - The label for the folder. Usually the folder name without the path.
 * @property {string} path - Full path to the folder in the data store.
 * @property {string} permission - The maximum permission level on the folder for the user. One of "read", "write", or "own".
 * @property {number} dateCreated - Folder creation date as milliseconds since the epoch.
 * @property {number} dateModified - Last modified date as milliseconds since the epoch.
 * @property {string} type - Either "file" or "folder". Should be "folder".
 * @property {number} shareCount - The number of users the folder has been shared with.
 * @property {number} fileCount - The number of files contained in the folder.
 * @property {Array<Object>} listing - A list of files and folders contained in the folder.
 */

export default gql`
    enum SortColumn {
        NAME
        ID
        LASTMODIFIED
        DATECREATED
        SIZE
        PATH
    }

    enum EntityType {
        FILE
        FOLDER
        DIR
        ANY
    }

    enum SortDirection {
        ASC
        DESC
    }

    enum Permission {
        READ
        WRITE
        OWN
    }

    interface FilesystemObject {
        id: String!
        label: String
        path: String!
        permission: Permission
        dateCreated: BigInt
        dateModified: BigInt
        type: EntityType
        shareCount: Int
    }

    type File implements FilesystemObject {
        # Interface implementation
        id: String!
        label: String
        path: String!
        permission: Permission
        dateCreated: BigInt
        dateModified: BigInt
        type: EntityType
        shareCount: Int

        # Specific to files
        infoType: String
        md5: String
        fileSize: BigInt
    }

    # Allows us to later extend the kinds of objects returned by a listing
    union FolderListingResult = File | Folder

    type Folder implements FilesystemObject {
        #Interface implementation
        id: String!
        label: String
        path: String!
        permission: Permission
        dateCreated: BigInt
        dateModified: BigInt
        type: EntityType
        shareCount: Int

        # Specific to folders
        fileCount: Int
    }

    # Allows us to fetch everything at once without having to cache results or
    # hit stat a bunch of times.
    type FolderListing {
        stat: Folder
        listing: [FilesystemObject]
    }
`;