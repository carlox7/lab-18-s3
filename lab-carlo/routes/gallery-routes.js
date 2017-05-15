'use strict';

const createError = require('http-errors');
const debug = require('debug')('cfgram:gallery-routes');
const bearerAuth = require('../lib/bearer-auth-middleware');
const galleryCntrl = require('../controller/gallery-controller');

module.exports = function(router) {
  router.post('/gallery', bearerAuth, (req, res) => {
    debug('#POST /api/gallery');

    galleryCntrl.createGallery(req.body, req.user)
    .then(gallery => res.json(gallery))
    .catch(err => res.status(err.status).send(err.message));
  });

  router.get('/gallery/:id', bearerAuth, (req, res) => {
    debug('#GET /api/gallery/:id');

    galleryCntrl.fetchGallery(req.params.id)
    .then(gallery => {
      if(gallery.userId.toString() !== req.user._id.toString()) {
        return createError(401, 'Invalid User');
      }
      res.json(gallery);
    })
    .catch(err => res.status(err.status).send(err.message));
  });

  router.put('/gallery/:id', bearerAuth, (req, res) => {
    debug('#PUT /api/gallery/:id');

    galleryCntrl.updateGallery(req, res, req.params.id)
    .then(gallery => res.json(gallery))
    .catch(err => res.status(err.status).send(err.message));
  });

  router.delete('/gallery/:id', bearerAuth, (req, res) => {
    debug('#DELETE /api/gallery/:id');

    galleryCntrl.deleteGallery(req, res, req.params.id);
  });

  return router;
};
