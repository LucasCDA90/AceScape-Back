// controllers/UserController.js

const UserService = require('../services/UserService');
const LoggerHttp = require('../utils/logger').http;
const passport = require('passport');

// La fonction pour gérer l'authentification depuis passport
/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Authentifie un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Authentification réussie"
 *       401:
 *         description: Nom d'utilisateur ou mot de passe incorrect
 *       500:
 *         description: Erreur interne du serveur
 */
module.exports.loginUser = function (req, res, next) {
  passport.authenticate('login', { badRequestMessage: 'Les champs sont manquants.' }, async function (err, user) {
    if (err) {
      res.statusCode = 401;
      return res.send({ msg: "Le nom d'utilisateur ou le mot de passe n'est pas correct", type_error: 'no-valid-login' });
    }
    req.logIn(user, async function (err) {
      if (err) {
        res.statusCode = 500;
        return res.send({ msg: "Problème d'authentification sur le serveur.", type_error: 'internal' });
      } else {
        return res.send(user);
      }
    });
  })(req, res, next);
};

// La fonction permet d'ajouter un utilisateur
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Ajoute un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       404:
 *         description: Ressource non trouvée
 *       405:
 *         description: Erreur de validation ou duplication
 */
module.exports.addOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Création d'un utilisateur");
  UserService.addOneUser(req.body, null, function (err, value) {
    if (err && err.type_error == 'no found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == 'validator') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'duplicate') {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// La fonction permet d'ajouter plusieurs utilisateurs
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Ajoute plusieurs utilisateurs
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 *     responses:
 *       201:
 *         description: Utilisateurs créés
 *       405:
 *         description: Erreur de validation
 */
module.exports.addManyUsers = function (req, res) {
  req.log.info('Création de plusieurs utilisateurs');
  UserService.addManyUsers(req.body, null, function (err, value) {
    if (err) {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// La fonction permet de chercher un utilisateur avec son id
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Recherche un utilisateur par ID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *       405:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
module.exports.findOneUserById = function (req, res) {
  req.log.info("Recherche d'un utilisateur par son id");
  UserService.findOneUserById(req.params.id, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == 'no-valid') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher un utilisateur par les champs autorisés
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Recherche un utilisateur par champs
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: fields
 *         required: true
 *         schema:
 *           type: string
 *         description: Champs de recherche
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 *         description: Valeur de recherche
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 *       405:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
module.exports.findOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Recherche d'un utilisateur par un champ autorisé");
  let fields = req.query.fields;
  if (fields && !Array.isArray(fields)) fields = [fields];
  UserService.findOneUser(fields, req.query.value, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == 'no-valid') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher plusieurs utilisateurs avec leur id
/**
 * @swagger
 * /api/users/multiple:
 *   get:
 *     summary: Recherche plusieurs utilisateurs par ID
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Liste des IDs des utilisateurs
 *     responses:
 *       200:
 *         description: Utilisateurs trouvés
 *       404:
 *         description: Utilisateur(s) non trouvé(s)
 *       405:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
module.exports.findManyUsersById = function (req, res) {
  LoggerHttp(req, res);
  req.log.info('Recherche de plusieurs utilisateurs', req.query.id);
  var arg = req.query.id;
  if (arg && !Array.isArray(arg)) arg = [arg];
  UserService.findManyUsersById(arg, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == 'no-valid') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher plusieurs utilisateurs
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Recherche plusieurs utilisateurs avec pagination
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *         description: Taille de la page
 *       - in: query
 *         name: q
 *         required: false
 *         schema:
 *           type: string
 *         description: Valeur de recherche
 *     responses:
 *       200:
 *         description: Utilisateurs trouvés
 *       405:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
module.exports.findManyUsers = function (req, res) {
  req.log.info('Recherche de plusieurs utilisateurs');
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let searchValue = req.query.q;
  UserService.findManyUsers(searchValue, pageSize, page, null, function (err, value) {
    if (err && err.type_error == 'no-valid') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de modifier un utilisateur
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifie un utilisateur
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *       404:
 *         description: Utilisateur non trouvé
 *       405:
 *         description: Erreur de validation ou duplication
 *       500:
 *         description: Erreur serveur
 */
module.exports.updateOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Modification d'un utilisateur");
  UserService.updateOneUser(req.params.id, req.body, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && (err.type_error == 'no-valid' || err.type_error == 'validator' || err.type_error == 'duplicate')) {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de modifier plusieurs utilisateurs
/**
 * @swagger
 * /api/users/multiple:
 *   put:
 *     summary: Modifie plusieurs utilisateurs
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Liste des IDs des utilisateurs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateurs modifiés
 *       404:
 *         description: Utilisateur(s) non trouvé(s)
 *       405:
 *         description: Erreur de validation ou duplication
 *       500:
 *         description: Erreur serveur
 */
module.exports.updateManyUsers = function (req, res) {
  LoggerHttp(req, res);
  req.log.info('Modification de plusieurs utilisateurs');
  var arg = req.query.id;
  if (arg && !Array.isArray(arg)) arg = [arg];
  var updateData = req.body;
  UserService.updateManyUsers(arg, updateData, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && (err.type_error == 'no-valid' || err.type_error == 'validator' || err.type_error == 'duplicate')) {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de supprimer un utilisateur
/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprime un utilisateur
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur non trouvé
 *       405:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
module.exports.deleteOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Suppression d'un utilisateur");
  UserService.deleteOneUser(req.params.id, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == 'no-valid') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de supprimer plusieurs utilisateurs
/**
 * @swagger
 * /api/users/multiple:
 *   delete:
 *     summary: Supprime plusieurs utilisateurs
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Liste des IDs des utilisateurs
 *     responses:
 *       200:
 *         description: Utilisateurs supprimés
 *       404:
 *         description: Utilisateur(s) non trouvé(s)
 *       405:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
module.exports.deleteManyUsers = function (req, res) {
  LoggerHttp(req, res);
  req.log.info('Suppression de plusieurs utilisateurs');
  var arg = req.query.id;
  if (arg && !Array.isArray(arg)) arg = [arg];
  UserService.deleteManyUsers(arg, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == 'no-valid') {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == 'error-mongo') {
      res.statusCode = 500;
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};
