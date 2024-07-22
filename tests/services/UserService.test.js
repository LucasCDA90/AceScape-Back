const UserService = require('../../services/UserService')
const chai = require('chai');
let expect = chai.expect;
const _ = require('lodash')
var id_user_valid = ""
var tab_id_users = []
var users = []

describe("addOneUser", () => {
    it("Utilisateur correct. - S", () => {
        var user = {
            firstName: "Lucas",
            lastName: "Berger",
            username: "lucasberger",
            email: "lucas.berger@gmail.com",
            // isAdmin: true,
            password: "1234"
        }
        UserService.addOneUser(user, null, function (err, value) {
            expect(value).to.be.a('object');
            expect(value).to.haveOwnProperty('_id');
            id_user_valid = value._id
            users.push(value)
            done()
        })
    })
    it("Utilisateur incorrect. (Sans firstName) - E", () => {
        var user_no_valid = {
            lastName: "Berger",
            username: "lucasberger2",
            email: "lucas.berger2@gmail.com",            
            // isAdmin: true,
            password: "1234"
        }
        UserService.addOneUser(user_no_valid, null, function (err, value) {
            expect(err).to.haveOwnProperty('msg')
            expect(err).to.haveOwnProperty('fields_with_error').with.lengthOf(1)
            expect(err).to.haveOwnProperty('fields')
            expect(err['fields']).to.haveOwnProperty('firstName')
            expect(err['fields']['firstName']).to.equal('Path `firstName` is required.')
            done()
        })
    })
})

describe("addManyUsers", () => {
    it("Utilisateurs à ajouter, valide. - S", (done) => {
        var users_tab = [{
            firstName: "Lucas",
            lastName: "Berger",
            username: "lucasberger10",
            email: "lucas.berger10@gmail.com",
            // isAdmin: true,
            password: "1234"
        }, {
            firstName: "Lucas",
            lastName: "Berger",
            username: "lucasberger20",
            email: "lucas.berger20@gmail.com",
            // isAdmin: true,
            password: "1234"
        },
        {
            firstName: "Lucas",
            lastName: "Berger",
            username: "lucasberger30",
            email: "lucas.berger30@gmail.com",
            // isAdmin: true,
            password: "1234"
        }]

        UserService.addManyUsers(users_tab, null, function (err, value) {
            tab_id_users = _.map(value, '_id')
            users = [...value, ...users]
            expect(value).lengthOf(3)
            done()
        })
    })
    it("Utilisateurs à ajouter, non valide. - E", (done) => {
        var users_tab_error = [{
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean.dupont3@gmail.com",
            username: "edupont3",
            password: "1234"
        }, {
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean.dupont4@gmail.com",
            username: "",
            phone: "0645102340",
            password: "1234"
        },
        {
            firstName: "Jean",
            lastName: "Dupont",
            email: "jean.dupon5t@gmail.com",
            username: "jdupont4",
            phone: "0645102340",
            password: "1234"
        }, {
            firstName: "Lucas",
            email: "lucas.berger100@gmail.com",
            password: "1234"
        }]

        UserService.addManyUsers(users_tab_error, null, function (err, value) {
            done()
        })
    })
    
})