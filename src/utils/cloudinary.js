import {v2 as cloudinary} from "cloudinary"
//cloudinary is name of v2 now as wish
//fs filesystem use to read, write, remove, path by default in node.js
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLODINARY_CLOUD_NAME, 
    api_key: process.env.CLODINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload file on clodinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded sucessfully
        console.log("File is uploaded on cloudinary",
        response.url);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        //remove the locally saves temporary fiel as upload operation got failed
        return null;
    }
}

export {uploadOnCloudinary}
