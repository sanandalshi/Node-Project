import mysql from 'mysql2';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'collage',
  password: 'Wj28@krhps'
});

export default pool.promise();
