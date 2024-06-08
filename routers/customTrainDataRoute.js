import express from 'express';

import {
	trainCustomcompanyData,
	createCustomTrainCompanyData
} from '../controllers/customTrainDataController.js';
import  authenticateUser  from '../middlewares/login.js';


const customTrainDataRouter = express.Router();
customTrainDataRouter.post('/getCompanyData',authenticateUser, trainCustomcompanyData);
customTrainDataRouter.post('/createCustomTrainCompanyData',authenticateUser, createCustomTrainCompanyData);


export default customTrainDataRouter;