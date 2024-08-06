const UserService = require('../services/UserService');
const passport = require('passport');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management and login
 */

/**
 * @swagger
 * /login:
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
 *               $ref: '#/components/schemas/User'
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

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Déconnecte un utilisateur
 *     tags: [User]
 *     responses:
 *       201:
 *         description: Utilisateur déconnecté
 *       404:
 *         description: Utilisateur non trouvé
 */
module.exports.logoutUser = function(req, res) {
  req.log.info("Deconnexion d'un utilisateur");
  UserService.updateOneUser(req.user._id, {token: ""}, null, function(err, value) {
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
      res.send({msg: "L'utilisateur est deconnecté"});
    }
  })
};

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Ajoute un utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       405:
 *         description: Erreur de validation ou duplication
 *   get:
 *     summary: Recherche un utilisateur par champ
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: fields
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Champs de recherche
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         description: Valeur du champ
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
module.exports.addOneUser = function (req, res) {
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

/**
 * @swagger
 * /users:
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
 *               $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateurs créés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       405:
 *         description: Erreur de validation
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur(s) non trouvé(s)
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

/**
 * @swagger
 * /user/{id}:
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
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

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Recherche un utilisateur par champ
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: fields
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Champs de recherche
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         description: Valeur du champ
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 */
module.exports.findOneUser = function (req, res) {
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

/**
 * @swagger
 * /users:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur(s) non trouvé(s)
 */
module.exports.findManyUsersById = function (req, res) {
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

/**
 * @swagger
 * /users_by_filters:
 *   get:
 *     summary: Recherche de plusieurs utilisateurs par filtres
 *     tags: [User]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Taille de la page
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Valeur de recherche
 *     responses:
 *       200:
 *         description: Utilisateurs trouvés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
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

/**
 * @swagger
 * /user/{id}:
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
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur non trouvé
 *       405:
 *         description: Erreur de validation ou duplication
 */
module.exports.updateOneUser = function (req, res) {
  req.log.info("Modification d'un utilisateur");

  if (req.body.currency !== undefined) {
    if (typeof req.body.currency !== 'number' || req.body.currency < 0) {
      return res.status(400).send({
        msg: "La valeur de la monnaie doit être un nombre positif.",
        type_error: "invalid_currency"
      });
    }
  }

  UserService.updateOneUser(req.params.id, req.body, null, function (err, value) {
    if (err && err.type_error == 'no-found') {
      res.statusCode = 404;
      res.send(err);
    } else if (err && (err.type_error == 'no-valid' || err.type_error == 'validator' || err.type_error == 'duplicate')) {
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

/**
 * @swagger
 * /users:
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               currency:
 *                 type: number
 *     responses:
 *       200:
 *         description: Utilisateurs modifiés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Utilisateur(s) non trouvé(s)
 */
module.exports.updateManyUsers = function (req, res) {
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

/**
 * @swagger
 * /user/{id}:
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
 */
module.exports.deleteOneUser = function (req, res) {
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

/**
 * @swagger
 * /users:
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
 */
module.exports.deleteManyUsers = function (req, res) {
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
