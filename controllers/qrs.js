const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

const xlsx = require('node-xlsx');
const QRCode = require('qrcode-svg');
const PDFDocument = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');
const fs = require('fs');
const fsExtra = require('fs-extra');
const admZip = require('adm-zip');

const Qr = require('../models/Qr');

// @des     Get Qrs list
// @route   GET /api/v1/qrs
// @access  Public
exports.getQrs = asyncHandler(async (req, res, next) => {
  const qrs = await Qr.countDocuments();

  res.status(200).json({
    success: true,
    count: qrs
  });
});

// @des     Delete All Qrs
// @route   DELETE/api/v1/qrs
// @access  Private
exports.deleteQrs = asyncHandler(async (req, res, next) => {
  await Qr.deleteMany();

  res.status(200).json({
    success: true,
    count: 0
  });
});

// @des     Get Pdfs list
// @route   GET /api/v1/qrs/pdfs
// @access  Public
exports.getPdfs = asyncHandler(async (req, res, next) => {
  const items = await fs.readdirSync(process.env.FILE_PDF_PATH);

  console.log(items);

  res.status(200).json({
    success: true,
    count: items.length,
    data: items
  });
});

// @des     Delete All Pdfs
// @route   DELETE/api/v1/qrs
// @access  Private
exports.deletePdfs = asyncHandler(async (req, res, next) => {
  fsExtra.emptyDirSync(process.env.FILE_PDF_PATH);

  res.status(200).json({
    success: true,
    count: 0,
    data: {}
  });
});

// @des     Get Pdfs zip
// @route   GET /api/v1/qrs/pdfs/zip
// @access  Public
exports.getPdfsZip = asyncHandler(async (req, res, next) => {
  // creating archives
  const zip = new admZip();

  zip.addLocalFolder(process.env.FILE_PDF_PATH);
  // or write everything to disk
  zip.writeZip(`${process.env.FILE_PDF_PATH}/all-file.zip`);

  res.status(200).json({
    success: true,
    data: `all-file.zip`
  });
});

// @des     Create Qr pdf file
// @route   POST /api/v1/qrs
// @access  Private
exports.createQrsPdf = asyncHandler(async (req, res, next) => {
  const qrs = await Qr.find();

  if (!qrs || qrs.length === 0) {
    return next(ErrorResponse('No Qr data', 400));
  }

  // Create a document
  const doc = new PDFDocument({
    size: [212, 240],
    margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  PDFDocument.prototype.addSVG = function(svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options), this;
  };

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(
    fs.createWriteStream(
      `${process.env.FILE_PDF_PATH}/${qrs[0].name
        .replace(/\s+/g, '')
        .replace('/', '_')
        .trim()}-${qrs[qrs.length - 1].name
        .replace(/\s+/g, '')
        .replace('/', '_')
        .trim()}.pdf`
    )
  );

  qrs.map((qr, index) => {
    var svg = new QRCode({
      content: qr.codeUrl,
      padding: 0,
      width: 256,
      height: 256,
      color: '#000000',
      background: '#ffffff',
      ecl: 'M'
    }).svg();

    doc.addSVG(svg, 10, 10);

    // // // Embed a font, set the font size, and render some text
    doc
      .font('Courier')
      .fontSize(14)
      .text(qr.code.trim(), 25, 215);

    if (index < qrs.length - 1) doc.addPage();
  });

  // Finalize PDF file
  doc.end();

  res.status(200).json({
    success: true,
    count: 0
  });
});

// @des     Upload Qr Excel file to database
// @route   POST /api/v1/qrs/excel
// @access  Private
exports.uploadQrExcel = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse(`Please upload excel file`, 400));
  }

  const file = req.files.file;

  // Make sure the file is a excel
  if (
    !file.mimetype.startsWith(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
  ) {
    return next(new ErrorResponse('Please upload an image file', 400));
  }

  const qrsFile = xlsx.parse(file.data);

  const qrsFileObj = qrsFile[0].data.map(([name, code, codeUrl]) => {
    return {
      name,
      code,
      codeUrl
    };
  });

  const qrs = await Qr.insertMany(qrsFileObj);

  res.status(200).json({
    success: true,
    count: qrs.length
  });
});
