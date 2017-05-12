const Gallery = require('../model/gallery');


module.exports = exports = {};

exports.createGallery = function(body, user) {

  body.userId = user._id;
  return new Gallery(body).save()
  .then(gallery => gallery)
  .catch(err => body.status(err.status).send(err.message));
};

exports.fetchGallery = function(id, res) {

  return Gallery.findById(id)
  .then(gallery => gallery)
  .catch(err => res.status(err.status).send(err.message));

};

exports.updateGallery = function(req, res, id) {
  return Gallery.findByIdAndUpdate(id, req.body, {new:true})
  .then(gallery => gallery)
  .catch(err => res.status(err.status).send(err.message));
};

exports.deleteGallery = function(req, res, id) {
  Gallery.findByIdAndRemove(id)
  .then(() => res.status(204).send())
  .catch(err => res.send(err));
};
