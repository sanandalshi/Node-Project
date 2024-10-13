const express=require('express');
const ejs=require('ejs');
 const db=require('./util/database');
const app=express();
app.use(express.json());
const { buildSchema } = require('graphql');
const {graphqlHTTP}=require('express-graphql');
const isauth=require('./auth');
app.set('view engine','ejs');
const r=require('./routes/route');


async function func() {
    const [rows] = await db.execute('select * from intern');
    let arr = [];
    if (rows.length > 0) {
        for (let i of rows) {
            arr.push({ email: i.email, password: "not accessible", username: i.username });
        }
    }
    return arr; 
}


const schema=buildSchema(`
   type user {
       email: String!
       password: String
       username: String!
   } 

   type Query {
       getallusers: [user]
       getuserbyemail(email: String!): user
       getuserbyusername(username: String!): user
   }
       type Mutation{
       createuser(email:String!, password:String!,username:String!):user
       deleteuser(email:String!,username:String):user
        updateusername(email: String!, username: String!): user
       }
    `)


const root={

    getallusers: async () => {
        const arr = await func(); 
        return arr;
    },

    getuserbyemail: async ({ email }) => {
        const arr = await func(); 
        return arr.find(user => user.email == email); 
    },

    getuserbyusername: async ({ username }) => {
        const arr = await func(); 
        return arr.find(user => user.username ==username); 
    },

    createuser: async({email,password,username})=>{
const [row]=await db.execute('insert into intern (email,password,username )values(?,?,?)',[email,password,username]);
if(row.affectedRows >0){
      const [rows] = await db.execute('SELECT email, username FROM intern where email=? and username= ? ',[email,username]);
      const ans = rows.map(row => ({
        email: row.email,
        username: row.username,
        message: "User has been created"
    }));
      return ans[0];
}else{
    throw new Error("Some error has occurred while creating the user.");
}
    },

deleteuser: async ({ email, username }) => {
    const [row] = await db.execute('DELETE FROM intern WHERE email = ? AND username = ?', [email, username]);
    if (row.affectedRows > 0) {
        return {
            email: email,
            password: "This username has been deleted!",
            username: username,
        };
    } else {
        throw new Error("The user does not exits!");
    }
},

updateusername: async ({ email, username }) => {
 
    console.log('Email:', email);
    console.log('New Username:', username);
    if (!email || !username) {
        throw new Error("Email and username must be provided.");
    }
  const [row] = await db.execute('UPDATE intern SET username = ? WHERE email = ?', [username, email]);
   console.log('Affected Rows:', row.affectedRows); 
    if (row.affectedRows > 0) {
        return {
            "email": email,
            "password": "The user has been updated!",
            "username": username
        };
    } else {
        return {
            "email": email,
            "message": "No changes made; either the user does not exist or the username is the same."
        };
    }
}




}

app.use('/graphql',graphqlHTTP({
    schema:schema,
    rootValue:root,
    graphiql:true
}))


app.use(r);


app.listen(8080,()=>{
    console.log('port 8080 is running!');
})
