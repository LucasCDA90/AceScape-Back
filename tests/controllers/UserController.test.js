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
            username: "dwarfSlayer",
            email: "lutfu.us@gmail.com",
            password: "1234"
        }]
        ).end((err, res) => {
            res.should.have.status(201)

            users = [...users, ...res.body]
            done()
        });
    })
})