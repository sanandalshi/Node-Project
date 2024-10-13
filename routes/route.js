const a = require('express');
const app = a();
const { check, validationResult } = require('express-validator');
const route = a.Router();
const bp = require('body-parser');
app.use(bp.urlencoded({ extended: false }))
app.use(a.json());
app.set('view engine', 'ejs');
const ejs = require('ejs');

const db = require('../util/database');
const hash = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const isauth = require('../auth');

const secret = 'Pokemonsan@07';

function sorty(arr, key, substring) {
    return arr.sort((a, b) => {
        const textA = a[key] || "";
        const textB = b[key] || "";

        const indexA = textA.indexOf(substring);
        const indexB = textB.indexOf(substring);


        if (indexA === -1 && indexB === -1) {
            return 0;
        } else if (indexA === -1) {
            return 1;
        } else if (indexB === -1) {
            return -1;
        }
        return indexA - indexB;
    });
}
////////////////////////////////////////////////////////////////
route.get('/', (req, res) => {
    res.render('home');

})
/////////////////////////////////////////////////////////////////   
route.post('/login', [
    check('email').isEmail().withMessage('Enter a valid email!'),
    check('password')
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
        .isAlphanumeric().withMessage('Password must contain only letters and numbers'),
    check('username').notEmpty().withMessage('Username is required')

], async (req, res) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return res.status(400).json({ error: err.array() });
    }
    const email = req.body.email;
    const password = req.body.password;
    const uname = req.body.username;
    try {
        const [ans] = await db.execute('select * from intern where email= ?', [email]);
        console.log(ans[0]);
        if (ans.length > 0) {
            const user = ans[0];
            const pass = user.password;
            console.log(pass);
            const compare = await hash.compare(password, pass);
            if (compare || password == pass) {

                const use = {
                    user: user,
                    passwo: pass
                }
                const token = jwt.sign(use, secret);

                res.cookie("_id", token);

                res.json({ authentification: "true" });



            } else {
                res.json({ authentification: "false" });
            }
        } else {
            res.json({ "status": "user not found!" });
        }

    } catch (error) {
        console.log(error);
    }
})

//////////////////////////////////////////////////////////////////////////////////////////////////////
route.get('/search', [
    check('username').isAlphanumeric().withMessage('Invalid username!')
], async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
        return res.status(400).json({ "error": err.array() });
    }

    const user = req.query.username;
    console.log(user);
    if (!user) {
        return res.status(400).json({ error: 'Username is required' });
    }
    let arr = [];

    const [rows] = await db.execute('select * from intern');
    if (rows.length > 0) {
        for (const i of rows) {
            const str = String(user);
            let num = -1;

            num = String(i.username).indexOf(str);
            if (num !== -1) {
                arr.push({ email: i.email, name: i.username });
            }
        }
    }
    const ans = sorty(arr, 'name', String(user));
    res.json(ans);
});

/////////////////////////////////////////////////////////////////////////////////////
route.get('/pagination', async (req, res) => {

    const num = parseInt(req.query.num) || 1;
    const limit = 5;
    const offset = (num - 1) * limit;

    const query = `SELECT * FROM intern LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute(query);

    let ans = [];
    if (rows.length > 0) {
        for (let i of rows) {
            ans.push({ email: i.email, password: i.password, username: i.username });
        }
    }

    res.json(ans);
})
////////////////////////////////////////////////////////////////////////


route.post('/signup', [
    check('email').isEmail().withMessage('Enter a valid email!'),
    check('password')
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
        .isAlphanumeric().withMessage('Password must contain only letters and numbers'),
    check('username').notEmpty().withMessage('Username is required')

], async (req, res) => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        return res.status(400).json({ error: err.array() });
    }
    const email = req.body.email;
    const password = req.body.password;
    const uname = req.body.username;
    try {
        const [ans] = await db.execute('insert into intern(email,password,username) values(?,?,?)', [email,password,uname]);
       
        if (ans.affectedRows > 0) {
          res.json({"status":"A New User Has Been Createrd","email":email,"username":uname});

        } else {
            res.json({ "status": "An Error has been occured!" });
        }

    } catch (error) {
        console.log(error);
    }
})

//////////////////////////////////////////////////////////////


route.get('/sort', async (req, res) => {
    const para = req.query.para;
    console.log(para);
    const [field, order] = para.split('/'); 
    console.log(field);
    console.log(order);

    const [rows] = await db.execute('SELECT * FROM intern'); 
    let arr = [];

    if (rows.length > 0) {
    
        for (let i of rows) {
            arr.push({ email: i.email, password: i.password, username: i.username, id: i._id });
        }
    }

    if (field === "email") {
        arr.sort((a, b) => order === 'desc' ? b.email.localeCompare(a.email) : a.email.localeCompare(b.email));
    } else if (field === "username") {
        arr.sort((a, b) => order === 'desc' ? b.username.localeCompare(a.username) : a.username.localeCompare(b.username));
    } else if (field === "id") {
        arr.sort((a, b) => order === 'desc' ? b.id - a.id : a.id - b.id);
    } else {
        return res.status(400).json({ error: "Invalid sort field. Use 'email', 'username', or 'id'." });
    }

    console.log(arr); 
    res.json(arr); 
});









module.exports = route;