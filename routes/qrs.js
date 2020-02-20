const express = require('express');

const {
  uploadQrExcel,
  getQrs,
  getPdfs,
  deleteQrs,
  createQrsPdf,
  getPdfsZip
} = require('../controllers/qrs');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getQrs)
  .delete(deleteQrs)
  .post(createQrsPdf);

router.route('/pdfs').get(getPdfs);

router.route('/pdfs/zip').get(getPdfsZip);

router.route('/excels').post(uploadQrExcel);

module.exports = router;
