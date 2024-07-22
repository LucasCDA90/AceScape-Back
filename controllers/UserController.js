const UserService = require('../services/UserService')
const LoggerHttp = require ('../utils/logger').http
const passport = require('passport')

// la fonction pour gerer l'authentification depuis passport
module.exports.loginUser = function(req, res, next) {
    passport.authenticate('login', { badRequestMessage: "Les champs sont manquants."}, async function(err, user) {
        if(err){
            res.statusCode = 401
            return res.send({msg: "Le nom d'utilisateur ou le mot de passe n'est pas correct", type_error: "no-valid-login"})
        }
        req.logIn(user, async function (err) {
            if(err) {
                res.statusCode = 500
                return res.send({msg: "Probleme d'authentification sur le serveur.", type_error: "internal"})
            }else{
                return res.send(user)
            }
        })
    })(req, res, next)
}

// La fonction permet d'ajouter un utilisateur
module.exports.addOneUser = function(req, res) {
    LoggerHttp(req, res)
    req.log.info("Création d'un utilisateur")
    UserService.addOneUser(req.body, null, function(err, value) {
        if (err && err.type_error == "no found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)   
        }
        else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet d'ajouter plusieurs utilisateurs
module.exports.addManyUsers = function(req, res) {
    req.log.info("Création de plusieurs utilisateurs")
    UserService.addManyUsers(req.body, null, function(err, value) {
        if (err) {
            res.statusCode = 405
            res.send(err)
        }else {
            res.statusCode = 201
            res.send(value)
        }
    })
}