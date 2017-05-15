'use strict';

const server = require('../server.js');
const User = require('../model/user');
const chai = require('chai');
const http = require('chai-http');
const expect = chai.expect;
chai.use(http);

describe('Authorization Routes', function() {

  describe('#POST', function() {
    after(done => {
      User.remove({})
      .then(() => done())
      .catch(err => done(err));
    });

    describe('Sign up request', function() {

      it('Should respond with 200 status on successful post', done => {
        chai.request(server)
        .post('/api/signup')
        .send({username: 'Carlomari', email: 'carlomari@squidward.com', password: 'octoplex'})
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
      });

      it('Should respond with 401 status on bad post', done => {
        chai.request(server)
        .post('/api/signup')
        .send('bologna')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
      });
    });
  });

  describe('#GET', function() {
    before(done => {
      chai.request(server)
      .post('/api/signup')
      .send({username: 'Carlomari', email: 'carlomari@squidward.com', password: 'octoplex'})
      .end(() => done());
    });
    after(done => {
      User.remove({})
      .then(() => done())
      .catch(err => done(err));
    });

    describe('Getting user data', function() {
      it('Should respond with 200 on successful get', done => {
        chai.request(server)
        .get('/api/signin')
        .auth('Carlomari', 'octoplex')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
      });

      it('Should not respond with bologna on successful get', done => {
        chai.request(server)
        .get('/api/signin')
        .auth('Carlomari', 'octoplex')
        .end((err, res) => {
          expect(res).to.not.have.status('bologna');
          done();
        });
      });

      it('Should respond with 401 on bad request', done => {
        chai.request(server)
        .get('/api/signin')
        .auth('bologna')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
      });

      it('Should not respond bologna on bad request', done => {
        chai.request(server)
        .get('/api/signin')
        .auth('bologna')
        .end((err, res) => {
          expect(res).to.not.have.status('bologna');
          done();
        });
      });
    });
  });
});
