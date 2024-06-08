import express from 'express'
const fileRouter = express.Router();
import {uploadFile , uploadFileToS3} from '../controllers/fileUploadController.js'
import  authenticateUser  from '../middlewares/login.js';
fileRouter.route("/upload").post( uploadFileToS3.single("file"),uploadFile);

export default fileRouter;