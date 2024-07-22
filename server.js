// 1ere chose à faire, importer les librairies
const express = require('express')              
const _ = require("lodash")
const bodyParser = require('body-parser')
const Config = require ('./config')
const Logger = require('./utils/logger').pino

// Création de notre application express.js
const app = express()

// Démarrage de la database
require('./utils/database')

// Ajout du module de login
const passport = require('./utils/passport')
// passport init

var session = require('express-session')

app.use(session({
    secret: Config.secret_cookie,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())

// Déclaration des controllers pour l'utilisateur
const UserController = require('./controllers/UserController')

// Déclaration des middlewares
const DatabaseMiddleware = require('./middlewares/database')
const LoggerMiddleware = require('./middlewares/logger')

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger)

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/
app.post('/login', DatabaseMiddleware.checkConnexion, UserController.loginUser)

// Création du endpoint /user pour l'ajout d'un utilisateur
app.post('/user', DatabaseMiddleware.checkConnexion, UserController.addOneUser)

// Création du endpoint /users pour l'ajout de plusieurs utilisateurs
app.post('/users', DatabaseMiddleware.checkConnexion, UserController.addManyUsers)

// Création du endpoint /user pour la récupération d'un utilisateur par le champ selectionné
app.get('/user', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUser)

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
app.get('/user/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUserById)

// Création du endpoint /user pour la récupération de plusieurs utilisateurs via l'idS
app.get('/users', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsersById)

// Création du endpoint /users_by_filters pour la récupération de plusieurs utilisateurs
app.get('/users_by_filters', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsers)

// Création du endpoint /user pour la modification d'un utilisateur
app.put('/user/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateOneUser)



module.exports = app