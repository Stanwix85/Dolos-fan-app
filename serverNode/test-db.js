require('dotenv').config();
const mysql = require('mysql2/promise');

async function testconnection() {
    console.log(`Attempting to connect to ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USER}...`)

try {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 6603,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD, 
    });

    console.log("successfully connected to MySQL");
    // Test a basic query
    const [rows] = await connection.query('SELECT VERSION() AS version, NOW() AS currentTime;');
    console.log('MySQL Version:', rows[0].version);
    console.log('Server Time:  ', rows[0].currentTime);
    await connection.end();
    console.log("Connection closed");
} catch (error){
    console.error(' Connection failed!');
    console.error(`Code:    ${error.code}`);
    console.error(`Message: ${error.message}`);
}
}
testconnection();