// routes/embeddingRoutes.js
import express from 'express';
import multer from 'multer';
import {
  addEmbeddedText,
  updateEmbeddedText,
  deleteEmbeddings,
  deleteNamespaceEmbeddings
} from '../controllers/embeddingController.js';

const router = express.Router();
// Setup multer for in-memory file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/add_embedded', upload.single('file'), addEmbeddedText);
router.put('/update_embedded', updateEmbeddedText);
router.delete('/delete_embedded/ids', deleteEmbeddings);
router.delete('/delete_embedded/namespace', deleteNamespaceEmbeddings);

export default router;
