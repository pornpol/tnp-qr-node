const express = require('express');

const {
  uploadQrExcel,
  getQrs,
  getPdfs,
  deleteQrs,
  createQrsPdf,
  getPdfsZip,
  deletePdfs
} = require('../controllers/qrs');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getQrs)
  .delete(deleteQrs);

router
  .route('/pdfs')
  .get(getPdfs)
  .post(createQrsPdf)
  .delete(deletePdfs);

router.route('/zip').get(getPdfsZip);

router.route('/excels').post(uploadQrExcel);

module.exports = router;
