const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('./../../server')
let should = chai.should();
const _ = require('lodash')

var users = []
var valid_token = ''

chai.use(chaiHttp)

describe("POST - /user", () => {
    it("Ajouter un utilisateur. - S", (done) => {
        chai.request(server).post('/user').send({
            firstName: "Sylvie",
            lastName: "Fitsch",
            username: "sylviefitsch",
            email: "sylvie.fitsch@gmail.com",
            // isAdmin: true,
            password: "1234"
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans firstName) - E", (done) => {
        chai.request(server).post('/user').send({
            lastName: "Berger",
            username: "lucasberger2",
            email: "lucas.berger2@gmail.com",
            // isAdmin: true,
            password: "1234"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un username existant) - E", (done) => {
        chai.request(server).post('/user').send({
            lastName: "Berger",
            username: "lucasberger2",
            email: "lucas.berger3@gmail.com",
            // isAdmin: true,
            password: "1234"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/user').send({
            firstName: "Mike",
            lastName: "",
            username: "mikeparty",
            email: "mike.party@gmail.com",
            // isAdmin: true,
            password: "1234"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("POST - /users", () => {
    it("Ajouter plusieurs utilisateurs. - S", (done) => {
        chai.request(server).post('/users').send([{
            firstName: "Sylvie",
            lastName: "Fitsch",
            username: "sylviefitsch1",
            email: "sylvie.fitsch1@gmail.com",
            // isAdmin: true,
            password: "1234"
        },
        {
            firstName: "Lutfu",
            lastName: "Us",
            username: "lutfu.us",
            email: "lutfu.us@gmail.com",
            // isAdmin: true,
            password: "1234"
        }]
        ).end((err, res) => {
            res.should.have.status(201)

            users = [...users, ...res.body]
            done()
        });
    })
})

describe("POST - /login", () => {
    it("Authentifier un utilisateur correct. - S", (done) => {
        chai.request(server).post('/login').send({username: 'sylviefitsch1', password: '1234'})
        .end((err, res) => {
            res.should.have.status(200)
            valid_token = res.body.token
            done()
        })
    })
    it("Authentifier un utilisateur incorrect. (username inexistant) - E", (done) => {
        chai.request(server).post('/login').send({username: 'zdesfrgtyhj', password: '1234'})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("entifier un utilisateur incorrect. (password incorrect) - E", (done) => {
        chai.request(server).post('/login').send({username: 'sylviefitsch1', password: '7894'})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("GET - /user/:id", () => {
    it("Chercher un utilisateur correct. - S", (done) => {
        chai.request(server).get('/user/' + users[1]._id).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Chercher un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/user/665f18739d3e172be5daf092').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).get('/user/123').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher un utilisateur sans etre authentifié. - E", (done) => {
        chai.request(server).get('/user/' + users[0]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    
})

describe("GET - /user", () => {
    it("Chercher un utilisateur par un champ selectionné. - S", (done) => {
        chai.request(server).get('/user').auth(valid_token, { type: 'bearer' }).query({fields: ['username'], value: users[0].username})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Chercher un utilisateur avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/user').auth(valid_token, { type: 'bearer' }).query({fields: ['firstName'], value: users[0].firstName})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher un utilisateur sans tableau de champ. - E", (done) => {
        chai.request(server).get('/user').auth(valid_token, { type: 'bearer' }).query({value: users[0].firstName})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).get('/user').auth(valid_token, { type: 'bearer' }).query({fields: ['username'], value: ''})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher un utilisateur sans aucunes querys. - E", (done) => {
        chai.request(server).get('/user').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher un utilisateur inexistant. - E", (done) => {
        chai.request(server).get('/user').auth(valid_token, { type: 'bearer' }).query({fields: ['username'], value: 'users[0].firstName'})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher un utilisateur par un champ selectionné sans etre authentifié. - E", (done) => {
        chai.request(server).get('/user').query({fields: ['username'], value: users[0].username})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("GET - /users", () => {
    it("Chercher plusieurs utilisateurs. - S", (done) => {
        chai.request(server).get('/users').auth(valid_token, { type: 'bearer' }).query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body).to.be.an('array')
            done()
        })
    })

    it("Chercher plusieurs utilisateurs incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).get('/users').auth(valid_token, { type: 'bearer' }).query({id: ["66791a552b38d88d8c6e9ee7", "66791a822b38d88d8c6e9eed"]})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Chercher plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).get('/users').auth(valid_token, { type: 'bearer' }).query({id: ['123', '456']})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Chercher plusieurs utilisateurs sans etre authentifié. - E", (done) => {
        chai.request(server).get('/users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("GET - /users_by_filters", () => {
    it("Chercher plusieurs utilisateurs. - S", (done) => {
        chai.request(server).get('/users_by_filters').auth(valid_token, { type: 'bearer' }).query({page: 1, pageSize: 2})
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Chercher plusieurs utilisateurs avec une query vide - S", (done) => {
        chai.request(server).get('/users_by_filters').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            expect(res.body.count).to.be.equal(3)
            done()
        })
    })
    it("Chercher plusieurs utilisateurs avec une query contenant une chaine de caractère - S", (done) => {
        chai.request(server).get('/users_by_filters').auth(valid_token, { type: 'bearer' }).query({page: 1, pageSize: 2, q: 'lu'})
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            expect(res.body.count).to.be.equal(1)
            done()
        })
    })
    it("Chercher plusieurs utilisateurs avec une chaine de caractères dans page - E", (done) => {
        chai.request(server).get('/users_by_filters').auth(valid_token, { type: 'bearer' }).query({page: 'une phrase', pageSize: 2})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Chercher plusieurs utilisateurs sans etre authentifié. - E", (done) => {
        chai.request(server).get('/users_by_filters').query({page: 1, pageSize: 2})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("PUT - /user", () => {
    it("Modifier un utilisateur. - S", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(valid_token, { type: 'bearer' }).send({ firstName: "Olivier" })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Modifier un utilisateur avec mise à jour de la monnaie. - S", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(valid_token, { type: 'bearer' }).send({ currency: 100 })
          .end((err, res) => {
            res.should.have.status(200);
            expect(res.body).to.have.property('currency', 100);
            done();
          });
      });
    
      it("Essayer de modifier la monnaie avec une valeur négative. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(valid_token, { type: 'bearer' }).send({ currency: -50 })
          .end((err, res) => {
            res.should.have.status(400);
            expect(res.body).to.have.property('type_error', 'invalid_currency');
            done();
          });
      });

    it("Modifier un utilisateur avec un id invalide. - E", (done) => {
        chai.request(server).put('/user/123456789').auth(valid_token, { type: 'bearer' }).send({firstName: "Olivier", lastName: "Edouard"})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un utilisateur avec un id inexistant. - E", (done) => {
        chai.request(server).put('/user/66791a552b38d88d8c6e9ee7').auth(valid_token, { type: 'bearer' }).send({firstName: "Olivier", lastName: "Edouard"})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier un utilisateur avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(valid_token, { type: 'bearer' }).send({ firstName: "", lastName: "Edouard" })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un utilisateur avec un champ unique existant. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(valid_token, { type: 'bearer' }).send({ username: users[1].username})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier un utilisateur sans etre authentifié. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).send({ firstName: "Olivier" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("PUT - /users", () => {
    it("Modifier plusieurs utilisateurs. - S", (done) => {
        chai.request(server).put('/users').auth(valid_token, { type: 'bearer' }).query({id: _.map(users, '_id')}).send({ firstName: "lucas" })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })

    it("Modifier plusieurs utilisateurs avec des ids invalide. - E", (done) => {
        chai.request(server).put('/users').auth(valid_token, { type: 'bearer' }).query({id: ['267428142', '41452828']}).send({firstName: "Olivier"})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier plusieurs utilisateurs avec des ids inexistant. - E", (done) => {
        chai.request(server).put('/users').auth(valid_token, { type: 'bearer' }).query({id: ['66791a552b38d88d8c6e9ee7', '667980886db560087464d3a7']})
        .send({firstName: "Olivier"})
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Modifier des utilisateurs avec un champ requis vide. - E", (done) => {
        chai.request(server).put('/users').auth(valid_token, { type: 'bearer' }).query({id: _.map(users, '_id')}).send({ firstName: ""})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier des utilisateurs avec un champ unique existant. - E", (done) => {
        chai.request(server).put('/users').auth(valid_token, { type: 'bearer' }).query({id: _.map(users, '_id')}).send({ username: users[1].username})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Modifier plusieurs utilisateurs sans etre authentifié. - E", (done) => {
        chai.request(server).put('/users').query({id: _.map(users, '_id')}).send({ firstName: "lucas" })
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("DELETE - /user", () => {
    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/user/' + users[2]._id).auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/user/665f18739d3e172be5daf092').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
    it("Supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/user/123').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Supprimer un utilisateur sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/user/' + users[1]._id)
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("DELETE - /users", () => {
    it("Supprimer plusieurs utilisateurs incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/users/665f18739d3e172be5daf092&665f18739d3e172be5daf093').auth(valid_token, { type: 'bearer' })
        .end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })

    it("Supprimer plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/users').auth(valid_token, { type: 'bearer' }).query({id: ['123', '456']})
        .end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })

    it("Supprimer plusieurs utilisateurs sans etre authentifié. - E", (done) => {
        chai.request(server).delete('/users').query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })

    it("Supprimer plusieurs utilisateurs. - S", (done) => {
        chai.request(server).delete('/users').auth(valid_token, { type: 'bearer' }).query({id: _.map(users, '_id')})
        .end((err, res) => {
            res.should.have.status(200)
            done()
        })
    }) 
})