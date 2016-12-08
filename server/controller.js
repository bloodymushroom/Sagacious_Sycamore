var db = require('../data/database.js');
var Pet = db.Pet;
var User = db.User;
var bcrypt = require('bcrypt');

var urls = {
  default: 'http://default.gif',
  coding: 'http://coding.gif',
  dead: 'http://dead.gif',
  sick: 'http://sick.gif',
  happy: 'http://happy.gif',
  runaway: 'http://runaway.gif'
};

module.exports = {
  get: function(req, res, next) {
    Pet.findOne({})
      .then(function(query) {
        var pet = query.dataValues;
        res.statusCode = 200;
        res.end(JSON.stringify(pet));
      })
  },
  post: function(req, res, next) {
    Pet.findOne({})
      .then(function(pet) {
        if (pet) {
          var newStatus = req.body.status;
          pet.status = newStatus; 
          pet.img = urls[newStatus];
          pet.save().then(function(data) {
            console.log('updated database');
            res.statusCode = 201;
            res.end(JSON.stringify(data.dataValues));
          });
        } else {
          console.log('no pets found!');
        }
      })
  },

  //User Authentication
  login: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ where: {username: username} })
      .then(function(user){
        if (user) {
          user = user.dataValues;
          //Update here to hash your password;
          bcrypt.compare(password, user.password, function(err, match) {
            if (err) {
              throw err;
            } else if (match) {
              console.log('Login successful');
              req.session.regenerate(function() {
                req.session.user = user.username;
                res.redirect('/');
              })
            } else {
              console.log('Wrong password');
              res.redirect('/login');
            }
          })
        } else {
          console.log('Username not found');
          res.redirect('/login');
        }
      })
      .catch(function(err) {
        console.log(err);
        res.redirect('/login');
      })
  },

  logout: function(req, res, next) {
    req.session.destroy(function() {
      res.redirect('/login');
    });
  },

  signup: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    User.find({ where: {username: username} })
      .then(function(user) {
        if (!user) {
          bcrypt.genSalt(10, function(err, salt) {
            if (err) {
              throw err;
            } else {
              bcrypt.hash(password, salt, function(err, hash) {
                if (err) {
                  throw err;
                } else {
                  User.create({username: username, password: hash}).then(function() {
                    console.log('Saved user.');
                    res.redirect('/login');
                  });
                }
              })
            }
          })          
        } else {
          console.log('Account already exists');
          res.redirect('/login');
        }
      });
  }
}