'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const chai = require('chai');
const http = require('chai-http');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user');
const Gallery = require('../model/gallery');
const url = `http://localhost:${process.env.PORT}`;
chai.use(http);

const testUser = {
  username: 'carlomari',
  password: 'octoplex',
  email: 'carlomari@squidbilly.com',
};

const testUserTwo = {
  username: 'carlo',
  password: 'password',
  email: 'carlo@carlo.com',
};

const testGallery = {
  name: 'my test gallery',
  desc: 'test all the things',
};

const testGalleryTwo = {
  name: 'another test gallery',
  desc: 'this is testing!',
};

mongoose.Promise = Promise;

describe('Gallery Routes', function() {
  afterEach(done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(() => done());
  });

  describe('POST: /api/gallery', function() {
    before(done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(() => done());
    });

    it('Should return a gallery and have 200 status on good request', done => {
      request.post(`${url}/api/gallery`)
      .send(testGallery)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(testGallery.name);
        expect(res.body.desc).to.equal(testGallery.desc);
        expect(date).to.not.equal('bologna');
        expect(res).to.have.status(200);
        done();
      });
    });

    it('Should respond with 404 on bad request', done => {
      request.get(`${url}/api/gallery`)
      .send(testGallery)
      .set({
        Authorization: 'bologna',
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('GET: /api/gallery/:id', function() {
    before(done => {
      new User(testUserTwo)
      .generatePasswordHash(testUserTwo.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(err => done(err));
    });
    before(done => {
      testGalleryTwo.userId = this.tempUser._id.toString();
      new Gallery(testGalleryTwo).save()
      .then(gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(err => done(err));
    });

    after( () => {
      delete testGalleryTwo.userId;
    });


    it('Should return a gallery and respond with 200 on good request', done => {
      request.get(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(testGalleryTwo.name);
        expect(res.body.desc).to.equal(testGalleryTwo.desc);
        expect(res.body.desc).to.not.equal('bolgona');
        expect(date).to.not.equal('bologna');
        expect(res).to.have.status(200);
        done();
      });
    });

    it('Should respond with 404 on bad request', done => {
      request.get(`${url}/api/gallery`)
      .set({
        Authorization: 'bologna',
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('PUT Method', function() {
    const galleryUpdate = {
      name: 'Blast Hardcheese',
      desc: 'Big McLargeHuge',
    };
    before(done => {
      new User(testUserTwo)
      .generatePasswordHash(testUserTwo.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(err => done(err));
    });
    before(done => {
      testGalleryTwo.userId = this.tempUser._id.toString();
      new Gallery(testGalleryTwo).save()
      .then(gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(err => done(err));
    });

    after( () => {
      delete testGalleryTwo.userId;
    });

    it('should update gallery info and have 200 status on good request', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .send(galleryUpdate)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(galleryUpdate.name);
        expect(res.status).to.equal(200);
        expect(res.body.desc).to.equal(galleryUpdate.desc);
        expect(res.body.userId).to.equal(this.tempUser._id.toString());
        done();
      });
    });
    it('Should respond with 401 on bad request', done => {
      request.put(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: 'bologna',
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
  });

  describe('DELETE: /api/gallery/:id', function() {
    before(done => {
      new User(testUserTwo)
      .generatePasswordHash(testUserTwo.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(err => done(err));
    });
    before(done => {
      testGalleryTwo.userId = this.tempUser._id.toString();
      new Gallery(testGalleryTwo).save()
      .then(gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(err => done(err));
    });

    after( () => {
      delete testGalleryTwo.userId;
    });

    it('Should delete a gallery and respond with 204 on good request', done => {
      request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res).to.have.status(204);
        done();
      });
    });

    it('Should respond with 404 on bad request', done => {
      request.get(`${url}/api/gallery`)
      .set({
        Authorization: 'bologna',
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
});
