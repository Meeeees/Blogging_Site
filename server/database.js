const mysql = require('mysql2')

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: 'loophole-amateur-bursae',
    database: 'blogging'
})

async function TestConnection() {
    pool.query(
        'SHOW DATABASES',
        (err, result) => {
            if (err) {
                console.log(err)
                return false
            } else {
                return true
            }
        }
    )
}

async function insertUser(username, email, hashedPassword, description, pfp_url, uuid) {
    // pool.query(
    //     'INSERT INTO users (id, username, email, password, description, pfp_url) VALUES (?, ?, ?, ?, ?, ?)',
    //     [uuid, username, email, hashedPassword, description, pfp_url],
    //     (err, result) => {
    //         if (err) {
    //             console.log('false', err)
    //             return false
    //         } else {
    //             console.log('inserted', result)
    //             return true
    //         }
    //     }
    // )

    const [result] = await pool.promise().query(
        'INSERT INTO users (id, username, email, password, description, pfp_url) VALUES (?, ?, ?, ?, ?, ?)',
        [uuid, username, email, hashedPassword, description, pfp_url]
    )

    return {
        uuid,
        username,
        email,
        description,
        pfp_url
    }
}

async function selectUserEmail(email, res) {
    try {
        const result = await new Promise((resolve, reject) => {
            pool.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log(result);
                    resolve(result);
                }
            });
        });

        if (res) {
            res.status(200).json(result);
        }

        return result;
    } catch (error) {
        // Handle errors here
        console.error('Error in selectUserEmail:', error);
        return null; // or throw the error, depending on your error handling strategy
    }
}

async function selectUserId(id) {
    pool.query(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, result) => {
            if (err) {
                console.log(err)
                return false
            } else {
                console.log(result)
                return result
            }
        }
    )
}

async function GetPostsOfUser(id) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM posts WHERE user_id = ?', [id], (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(result);
                resolve(result);
            }
        });
    });
}


module.exports = {
    insertUser,
    selectUserEmail,
    selectUserId,
    TestConnection,
    GetPostsOfUser
}
