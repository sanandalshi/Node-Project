import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import bodyParser from 'body-parser';
import db from '../src/util/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';

import { RowDataPacket, OkPacket } from 'mysql2';


interface User extends RowDataPacket {
    email: string;
    password: string;
    username: string;
    _id?: number;
}
async function func(): Promise<{ email: string; password: string; username: string }[]> {
    const [rows]: any = await db.execute('select * from intern');
    let arr: { email: string; password: string; username: string }[] = [];
    if (rows.length > 0) {
        for (let i of rows) {
            arr.push({ email: i.email, password: "not accessible", username: i.username });
        }
    }
    return arr; 
}
const secret: string = 'Pokemonsan@07';
const app = express();
const route = Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');

function sorty(arr: any[], key: string, substring: string) {
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
///
const schema = buildSchema(`
    type User {
        email: String!
        password: String
        username: String!
        message: String
    }
 
    type Query {
        getallusers: [User]!
        getuserbyemail(email: String!): User
        getuserbyusername(username: String!): User
    }

    type Mutation {
        createuser(email: String!, password: String!, username: String!): User!
        deleteuser(email: String!, username: String): User
        updateusername(email: String!, username: String!): User
    }
`);
////////////////////////////////////////////////////////////
class UserNode {
    email: string;
    username: string;
    left: UserNode | null;
    right: UserNode | null;

    constructor(email: string, username: string) {
        this.email = email;
        this.username = username;
        this.left = null;
        this.right = null;
    }
}

class UserBST {
    root: UserNode | null;
    
    constructor() {
        this.root = null;
    }
    insert(email: string, username: string): void {
        const newNode = new UserNode(email, username);
        
        if (!this.root) {
            this.root = newNode;
            return;
        }

        let current = this.root;
        while (true) {
            if (username < current.username) {
                if (!current.left) {
                    current.left = newNode;
                    break;
                }
                current = current.left;
            } else {
                if (!current.right) {
                    current.right = newNode;
                    break;
                }
                current = current.right;
            }
        }
    }

    searchByPartialUsername(partialName: string): Array<{email: string, username: string}> {
        const results: Array<{email: string, username: string}> = [];
        
        const searchInTree = (node: UserNode | null) => {
            if (!node) return;
            
            if (node.username.toLowerCase().includes(partialName.toLowerCase())) {
                results.push({
                    email: node.email,
                    username: node.username
                });
            }
            
            searchInTree(node.left);
            searchInTree(node.right);
        };

        searchInTree(this.root);
        return results;
    }
}
let userBST = new UserBST();
let userMap = new Map<string, {email: string, username: string}>();
////////////////////////////////////////////////////////////////
route.get('/', (req: Request, res: Response): void => {
    res.render('home');
});
/////////////////////////////
route.post('/signup', [
    check('email').isEmail().withMessage('Enter a valid email!'),
    check('password')
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
        .isAlphanumeric().withMessage('Password must contain only letters and numbers'),
    check('username').notEmpty().withMessage('Username is required')
], async (req: Request, res: Response): Promise<void> => {
    const err = validationResult(req);
        if (!err.isEmpty()) {
            res.status(400).json({ error: err.array() });
            return;
        }
        const email: string = req.body.email;
        const password: string = req.body.password;
        const uname: string = req.body.username;

    try {
        const [result] = await db.execute<OkPacket>(
            'INSERT INTO intern(email, password, username) VALUES(?, ?, ?)',
            [email, password, uname]
        );
        
        if (result.affectedRows > 0) {
            userBST.insert(email, uname);
            userMap.set(email, {
                email: email,
                username: uname
            });
            
            res.json({ "status": "A New User Has Been Created", "email": email, "username": uname });
        } else {
            res.json({ "status": "An Error has occurred!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server Error' });
    }
});
/////////////////////////
route.post('/login', [
    check('email').isEmail().withMessage('Enter a valid email!'),
    check('password')
        .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
        .isAlphanumeric().withMessage('Password must contain only letters and numbers'),
    check('username').notEmpty().withMessage('Username is required')
], async (req: Request, res: Response): Promise<void> => {
    const err = validationResult(req);

    if (!err.isEmpty()) {
        res.status(400).json({ error: err.array() });
        return;
    }

    const email: string = req.body.email;
    const password: string = req.body.password;
    const uname: string = req.body.username;

    try {
        const [rows] = await db.execute<User[]>('SELECT * FROM intern WHERE email = ?', [email]);
        if (rows && rows.length > 0) {
            const user = rows[0];
            const pass = user.password;
            console.log(pass);
            const compare = await bcrypt.compare(password, pass);
            if (compare || password === pass) {
                const use = {
                    user: user,
                    passwo: pass
                };
                const token = jwt.sign(use, secret);
                res.cookie("_id", token);
                res.json({ authentication: "true" });
            } else {
                res.json({ authentication: "false" });
            }
        } else {
            res.json({ "status": "user not found!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

route.get('/search', [
    check('username').isAlphanumeric().withMessage('Invalid username!')
], async (req: Request, res: Response): Promise<void> => {
    try {
        const err = validationResult(req);
        if (!err.isEmpty()) {
            res.status(400).json({ "error": err.array() });
            return;
        }

        const searchTerm: string = req.query.username as string;
        if (!searchTerm) {
            res.status(400).json({ error: 'Username is required' });
            return;
        }

        if (!userBST.root) {
            const [rows] = await db.execute<User[]>('SELECT * FROM intern');
            if (rows && Array.isArray(rows)) {
                rows.forEach(user => {
                    userBST.insert(user.email, user.username);
                    userMap.set(user.email, {
                        email: user.email,
                        username: user.username
                    });
                });
            }
        }
        const results = userBST.searchByPartialUsername(searchTerm);
        const sortedResults = results.sort((a, b) => {
            const aIndex = a.username.toLowerCase().indexOf(searchTerm.toLowerCase());
            const bIndex = b.username.toLowerCase().indexOf(searchTerm.toLowerCase());
            return aIndex - bIndex;
        });

        res.json(sortedResults);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});



route.get('/pagination', async (req: Request, res: Response): Promise<void> => {
    const num: number = parseInt(req.query.num as string) || 1;
    const limit = 5;
    const offset = (num - 1) * limit;

    const query = `SELECT * FROM intern LIMIT ${limit} OFFSET ${offset}`;
    const [rows] = await db.execute<User[]>(query);

    let ans: any[] = [];
    if (rows) {
        for (let i of rows) {
            ans.push({ email: i.email, password: i.password, username: i.username });
        }
    }

    res.json(ans);
});





route.get('/sort', async (req: Request, res: Response): Promise<void> => {
    try {
        const para: string | undefined = req.query.para as string;
        
        if (!para) {
            res.status(400).json({ 
                error: "Missing sort parameter. Use format: '?para=field/order' (e.g. '?para=email/asc')" 
            });
            return;
        }

        if (!para.includes('/')) {
            res.status(400).json({ 
                error: "Invalid sort format. Use: field/order (e.g. email/asc)" 
            });
            return;
        }

        const [field, order] = para.split('/');

        const validFields = ['email', 'username', 'id'];
        if (!validFields.includes(field)) {
            res.status(400).json({ 
                error: `Invalid sort field. Use one of: ${validFields.join(', ')}` 
            });
            return;
        }

        const validOrders = ['asc', 'desc'];
        if (!validOrders.includes(order.toLowerCase())) {
            res.status(400).json({ 
                error: "Invalid sort order. Use either 'asc' or 'desc'" 
            });
            return;
        }

       
        const [rows] = await db.execute<User[]>('SELECT * FROM intern');
        let arr: Array<{
            email: string;
            password: string;
            username: string;
            id: number;
        }> = [];

        if (rows && rows.length > 0) {
            arr = rows.map(i => ({
                email: i.email,
                password: i.password,
                username: i.username,
                id: i._id || 0
            }));
        }
        switch (field) {
            case "email":
                arr.sort((a, b) => 
                    order.toLowerCase() === 'desc' 
                        ? b.email.localeCompare(a.email) 
                        : a.email.localeCompare(b.email)
                );
                break;
            case "username":
                arr.sort((a, b) => 
                    order.toLowerCase() === 'desc' 
                        ? b.username.localeCompare(a.username) 
                        : a.username.localeCompare(b.username)
                );
                break;
            case "id":
                arr.sort((a, b) => 
                    order.toLowerCase() === 'desc' 
                        ? b.id - a.id 
                        : a.id - b.id
                );
                break;
        }
        res.json(arr);

    } catch (error) {
        console.error('Sort error:', error);
        res.status(500).json({ 
            error: "Server error while sorting data" 
        });
    }
});


const root = {
  
    getallusers: async (): Promise<{ email: string; password: string; username: string }[]> => {
        const arr = await func();
        return arr;
    },

    getuserbyemail: async ({ email }: { email: string }): Promise<{ email: string; password: string; username: string } | undefined> => {
        const arr = await func();
        return arr.find(user => user.email === email);
    },

    getuserbyusername: async ({ username }: { username: string }): Promise<{ email: string; password: string; username: string } | undefined> => {
        const arr = await func();
        return arr.find(user => user.username === username);
    },

    // Mutation Resolvers
    createuser: async ({ email, password, username }: { 
        email: string; 
        password: string; 
        username: string 
    }): Promise<{ email: string; username: string; message: string }> => {
        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            const [result] = await db.execute<OkPacket>(
                'INSERT INTO intern (email, password, username) VALUES (?, ?, ?)',
                [email, hashedPassword, username]
            );

            if (result.affectedRows > 0) {
                return {
                    email,
                    username,
                    message: "User has been created successfully"
                };
            }
            throw new Error("Failed to create user");
        } catch (error) {
            throw new Error("Error creating user: " + (error as Error).message);
        }
    },

    deleteuser: async ({ email, username }: { 
        email: string; 
        username?: string 
    }): Promise<{ email: string; username: string; message: string }> => {
        try {
            const [result] = await db.execute<OkPacket>(
                'DELETE FROM intern WHERE email = ?',
                [email]
            );

            if (result.affectedRows > 0) {
                return {
                    email,
                    username: username || "",
                    message: "User has been deleted successfully"
                };
            }
            throw new Error("User not found");
        } catch (error) {
            throw new Error("Error deleting user: " + (error as Error).message);
        }
    },

    updateusername: async ({ email, username }: { 
        email: string; 
        username: string 
    }): Promise<{ email: string; username: string; message: string }> => {
        try {
            const [result] = await db.execute<OkPacket>(
                'UPDATE intern SET username = ? WHERE email = ?',
                [username, email]
            );

            if (result.affectedRows > 0) {
                return {
                    email,
                    username,
                    message: "Username has been updated successfully"
                };
            }
            throw new Error("User not found");
        } catch (error) {
            throw new Error("Error updating username: " + (error as Error).message);
        }
    }
};


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));




export default route;