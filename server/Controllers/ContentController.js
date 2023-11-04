const database = require('../database.js');
const jwt = require('jsonwebtoken');

async function GetPostsOfUser(userid) {
    try {
        const result = await database.GetPostsOfUser(userid)
        if (result) {
            return result
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    GetPostsOfUser
}