const mysql = require('mysql2')
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const database = require('../database.js');
const jwt = require('jsonwebtoken');
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword
}

(async () => {
    database.TestConnection().then((result) => {
        console.log('Connection successful')
    }).catch((err) => {
        console.log(err)
        return false
    })
})();


async function comparePassword(password, hashedPassword) {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch
}

async function verify(key, res) {
    try {
        console.log(key)
        jwt.verify(key, process.env.JWT_SECRET, (err, result) => {
            if (err) {
                console.log(err)
                res.status(200).json({ success: false })
            } else {
                res.status(200).json({
                    success: true,
                    result
                })
            }
        })
    } catch (error) {
        console.log(error)
        res.status(200).json(false)
    }
}

async function createUser(username, email, password, description, pfp) {
    try {
        const uuid = crypto.randomUUID();
        const hashedPassword = await hashPassword(password);

        const result = await database.insertUser(username, email, hashedPassword, description, pfp, uuid);
        if (result) {
            const token = await new Promise((resolve, reject) => {
                jwt.sign({ data: result }, process.env.JWT_SECRET, (err, token) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(token);
                    }
                });
            });

            console.log('token:', result)
            return token;
        } else {
            console.log('false:', result)
            return false;
        }
    } catch (error) {
        console.log(error);
        return false;
    }
}

async function loginUser(email, password, res) {
    try {
        let result = await database.selectUserEmail(email, false)
        if (result.length > 0) {
            const hashed = result[0].password
            const isMatch = await comparePassword(password, hashed)
            if (isMatch) {
                const token = await new Promise((resolve, reject) => {
                    jwt.sign({ data: result[0] }, process.env.JWT_SECRET, (err, token) => {
                        if (err) {
                            console.log(err);
                            reject(err);
                        } else {
                            resolve(token);
                        }
                    });
                });
                res.status(200).json({
                    success: true,
                    token
                })
            } else {
                res.status(401).json({
                    success: false
                })
            }
        } else {
            res.status(401).json({
                success: false
            })
        }
    } catch (error) {
        console.log(error)
    }
}

async function checkMail(email, res) {
    try {
        database.selectUserEmail(email, res)
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    hashPassword,
    comparePassword,
    createUser,
    loginUser,
    checkMail,
    verify
}