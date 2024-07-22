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
    it("Authentifier un utilisateur incorrect. (password incorrect) - E", (done) => {
        chai.request(server).post('/login').send({username: 'sylviefitsch1', password: '7894'})
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
            expect(res.body.count).to.be.equal(7)
            done()
        })
    })
    it("Chercher plusieurs utilisateurs avec une query contenant une chaine de caractère - S", (done) => {
        chai.request(server).get('/users_by_filters').auth(valid_token, { type: 'bearer' }).query({page: 1, pageSize: 2, q: 'lu'})
        .end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            expect(res.body.count).to.be.equal(5)
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