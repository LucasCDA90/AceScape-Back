// 1ere chose à faire, importer les librairies
const express = require('express');
const _ = require("lodash");
const bodyParser = require('body-parser');
const Config = require('./config');
const Logger = require('./utils/logger').pino;
const swaggerJsdoc = require('swagger-jsdoc'); // swagger
const swaggerUi = require('swagger-ui-express'); // swagger

// aller à http://localhost:3002/api-docs/

// Création de notre application express.js
const app = express();

// Configuration des options de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'AceScape API',
      version: '1.0.0',
      description: 'Documentation de l\'API pour AceScape',
    },
  },
  apis: ['./controllers/*.js'], // fichiers contenant les annotations Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Démarrage de la database
require('./utils/database');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Ajout du module de login
const passport = require('./utils/passport');
// passport init

var session = require('express-session');

app.use(session({
  secret: Config.secret_cookie,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // change to false for non-HTTPS or testing environments
}));

app.use(passport.initialize());
app.use(passport.session());

// Déclaration des controllers pour l'utilisateur
const UserController = require('./controllers/UserController');

// Déclaration des middlewares
const DatabaseMiddleware = require('./middlewares/database');
const LoggerMiddleware = require('./middlewares/logger');

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger);

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/

//Création du endpoint /login pour connecter un utilisateur
app.post('/login', DatabaseMiddleware.checkConnexion, UserController.loginUser);

//Création du endpoint /logout pour deconnecter un utilisateur
app.post('/logout', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.logoutUser)

// Création du endpoint /user pour l'ajout d'un utilisateur
app.post('/user', DatabaseMiddleware.checkConnexion, UserController.addOneUser);

// Création du endpoint /users pour l'ajout de plusieurs utilisateurs
app.post('/users', DatabaseMiddleware.checkConnexion, UserController.addManyUsers);

// Création du endpoint /user pour la récupération d'un utilisateur par le champ selectionné
app.get('/user', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUser);

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
app.get('/user/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUserById);

// Création du endpoint /user pour la récupération de plusieurs utilisateurs via l'idS
app.get('/users', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsersById);

// Création du endpoint /users_by_filters pour la récupération de plusieurs utilisateurs
app.get('/users_by_filters', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsers);

// Création du endpoint /user pour la modification d'un utilisateur
app.put('/user/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateOneUser);

// Création du endpoint /user pour la modification de plusieurs utilisateurs
app.put('/users', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateManyUsers);

// Création du endpoint /user pour la suppression d'un utilisateur
app.delete('/user/:id', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.deleteOneUser);

// Création du endpoint /user pour la suppression de plusieurs utilisateurs
app.delete('/users', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.deleteManyUsers);

module.exports = app;

// 2e chose à faire : Créer le server avec app.listen
app.listen(Config.port, () => {
  Logger.info(`Serveur démarré sur le port ${Config.port}.`);
});
