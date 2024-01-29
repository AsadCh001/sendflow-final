import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'dpkkaacjk',
  api_key: '775987195199584',
  api_secret: 'uLSlA65oNFr-jqWLGYmPPVElLT0',
});

// Create a storage engine for multer to use with Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    resource_type: 'raw',
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadExcelMiddleware = upload.single('ExcelFile');

const uploadExcelAPI = (req, res) => {
  uploadExcelMiddleware(req, res, (err) => {
    if (err) {
      console.error('Upload Error:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }

    // Using Cloudinary's response to get the filename
    if (req.file && req.file.path) {
      const filename = req.file.path;  // This is the file URL/path provided by Cloudinary
      console.log('Uploaded Filename:', filename);
      res.status(200).json({ success: true, filename });
    } else {
      res.status(500).json({ error: 'File upload failed', details: 'No file info received' });
    }
  });
};

export default uploadExcelAPI;
