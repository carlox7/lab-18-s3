'use strict';
const fs = require('fs');
const del = require('del');
const path = require('path');
const AWS = require('aws-sdk');
const dataDir = `${__dirname}/../data`;
const createError = require('http-errors');

const Pic = require('../model/pic');
const Gallery = require('../model/gallery');

AWS.config.setPromisesDependency(require('bluebird'));
const s3 = new AWS.S3();

function s3UploadProm(params) {
  return new Promise((resolve, reject) => {
    if(!params) return reject(new Error('Params required'));
    s3.upload(params, (err, data) => {
      resolve(data);
    });
  });
}

function s3DeleteProm(params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if(err) reject(err);
      resolve(data);
    });
  });
}
exports.createPic = function(req) {
  if(!req.file) return createError(400, 'Resource required');
  if(!req.file.path) return createError(500, 'File not saved');

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };

  return Gallery.findById(req.params.id)
  .then(() => s3UploadProm(params))
  .then(s3Data => {
    del([`${dataDir}/*`]);
    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      userID: req.user._id,
      galleryID: req.params.id,
      imageURI: s3Data.Location,
      objectKey: s3Data.Key,
    };
    return new Pic(picData).save();
  })
  .then(pic => pic)
  .catch(err => Promise.reject(err));
};

exports.deletePic = function(galleryId, picId) {
  return Pic.findById(picId)
  .then(pic => {
    console.log('pic at controller', pic);
    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: pic.objectKey,
    };
    return params;
  })
  .then(params => s3DeleteProm(params))
  .then(() => Pic.findByIdAndRemove(picId))
  .catch(err => Promise.reject(createError(404, err.message)));
};
