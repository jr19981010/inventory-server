require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { createPool } = require('mysql2');
const http = require('http');
const { Server: SocketIOServer } = require('socket.io');

const corsOptions = {
    origin: 'https://simple-inventory-system.netlify.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const pool = createPool({
    host: 'sql6.freemysqlhosting.net',
    database: 'sql6683534',
    user: 'sql6683534',
    password: 'dwex2GszFG',
    connectionLimit: 10,
});

const server = http.createServer();
const io = new SocketIOServer(server, { cors: corsOptions });


io.on('connection', (socket) => {

    socket.on('reloadDataInv', () => {
        pool.query(
            `SELECT  
            inv.id,
            i.name AS item,
            c.name AS category,
            inv.quantity
        FROM 
            inventory AS inv
        JOIN 
            items AS i
            ON 
            inv.item_id = i.id
        JOIN 
            categories AS c
            ON 
            inv.category_id = c.id
        ORDER BY
            inv.id ASC
        
        `,

            (error, result) => {
                if (result) {
                    console.log("RESULT items", result);
                    socket.emit('rdInv', result);
                } else {
                    console.log("ERROR inventory", error)
                }
            });
    });

    // inventory table
    socket.on('addInv', (data, callback) => {
        pool.query(`INSERT INTO inventory(item_id, category_id, quantity) VALUES(?, ?, ?)`, [data.item, data.category, data.quantity], (error, result) => {
            if (result) {
                console.log('Success adding inventory!', result);
                const addResult = { success: true };
                callback(addResult)
            } else {
                console.log('Error adding inventory:', error);
                const addResult = { success: false };
                callback(addResult)

            }
        });
    });

    socket.on('delInv', (data, callback) => {
        pool.query('DELETE FROM inventory WHERE id = ?', [data], (error, result) => {
            if (result) {
                const deletionResult = { success: true };
                callback(deletionResult);
            } else {
                console.log('Error Updating Inventory:', error);
                const deletionResult = { success: false };
                callback(deletionResult);
            }
        });
    });

    socket.on('editInv', (data, callback) => {
        console.log('Received editInv event with ID:', data);
        pool.query('UPDATE inventory SET item_id = ?, category_id = ?, quantity = ? WHERE id =?', [data.item, data.category, data.quantity, data.id], (error, result) => {
            if (result) {
                const updateResult = { success: true };
                callback(updateResult);
            } else {
                const updateResult = { success: false };
                callback(updateResult);
            }

        });
    });

    socket.on('srchInv', (searchTerm, callback) => {
        console.log('Received srchInv event with searchTerm:', searchTerm);
        pool.query(`
        SELECT  
        inventory.id,
        items.name AS item,
        categories.name AS category,
        inventory.quantity
FROM
        inventory
JOIN
        items ON inventory.item_id = items.id
JOIN   
        categories ON inventory.category_id = categories.id
WHERE
        LOWER(items.name) LIKE LOWER(?)
        OR
        LOWER(categories.name) LIKE LOWER(?)
        OR
        inventory.quantity LIKE LOWER(?)
    ;
                    `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`],
            (error, result) => {
                if (result) {
                    console.log("srch res inventories", result);
                    callback(result);
                } else {
                    console.log('ERROR inventories', error);
                    callback([]);
                }
            });
    });
    // end inventory table

    //item table
    socket.on('reloadDataItems', () => {
        pool.query(
            `SELECT
                       *
                    FROM
                    items`,
            (error, result) => {
                if (result) {
                    console.log("RESULT items", result);
                    socket.emit('rdItems', result);
                } else {
                    console.log('ERROR items', error);
                }
            });
    });

    socket.on('addItem', (data, callback) => {
        pool.query(
            `INSERT 
                    INTO 
                    items( name ) 
                    VALUES(?)`,
            [data.name], (error, result) => {
                if (result) {
                    console.log('Success adding item!', result);
                    const addResult = { success: true };
                    callback(addResult)
                } else {
                    console.log('Error adding item:', error);
                    const addResult = { success: false };
                    callback(addResult)

                }
            });
    });

    socket.on('editItem', (data, callback) => {
        console.log('Received editItem event with ID:', data);
        pool.query('UPDATE items SET name = ? WHERE id =?', [data.name, data.id], (error, result) => {
            if (result) {
                const updateResult = { success: true };
                callback(updateResult);
            } else {
                const updateResult = { success: false };
                callback(updateResult);
            }

        });
    });

    socket.on('delItem', (data, callback) => {
        pool.query('DELETE FROM items WHERE id = ?', [data], (error, result) => {
            if (result) {
                const deletionResult = { success: true };
                callback(deletionResult);
            } else {
                console.log('Error Updating items:', error);
                const deletionResult = { success: false };
                callback(deletionResult);
            }
        });
    });

    socket.on('srchItem', (searchTerm, callback) => {
        console.log('Received srchItem event with searchTerm:', searchTerm);
        pool.query(`
        SELECT  
        *
FROM
        items
WHERE
        LOWER(name) LIKE LOWER(?)
    ;
                    `, [`%${searchTerm}%`],
            (error, result) => {
                if (result) {
                    console.log("srch res items", result);
                    callback(result);
                } else {
                    console.log('ERROR items', error);
                    callback([]);
                }
            });
    });

    //end item table



    //category table
    socket.on('reloadDataCategory', () => {
        pool.query(
            `SELECT
                       *
                    FROM
                    categories`,
            (error, result) => {
                if (result) {
                    console.log("RESULT categories", result);
                    socket.emit('rdCategories', result);
                } else {
                    console.log('ERROR categories', error);
                }
            });
    });
    socket.on('addCat', (data, callback) => {
        pool.query(
            `INSERT 
                    INTO 
                    categories( name ) 
                    VALUES(?)`,
            [data.name], (error, result) => {
                if (result) {
                    console.log('Success adding category!', result);
                    const addResult = { success: true };
                    callback(addResult)
                } else {
                    console.log('Error adding category:', error);
                    const addResult = { success: false };
                    callback(addResult)

                }
            });
    });

    socket.on('editCat', (data, callback) => {
        console.log('Received editCat event with ID:', data);
        pool.query('UPDATE categories SET name = ? WHERE id =?', [data.name, data.id], (error, result) => {
            if (result) {
                const updateResult = { success: true };
                callback(updateResult);
            } else {
                const updateResult = { success: false };
                callback(updateResult);
            }

        });
    });

    socket.on('delCat', (data, callback) => {
        pool.query('DELETE FROM categories WHERE id = ?', [data], (error, result) => {
            if (result) {
                const deletionResult = { success: true };
                callback(deletionResult);
            } else {
                console.log('Error Updating category:', error);
                const deletionResult = { success: false };
                callback(deletionResult);
            }
        });
    });

    socket.on('srchCat', (searchTerm, callback) => {
        console.log('Received srchCat event with searchTerm:', searchTerm);
        pool.query(`
        SELECT  
        *
FROM
        categories
WHERE
        LOWER(name) LIKE LOWER(?)
    ;
                    `, [`%${searchTerm}%`],
            (error, result) => {
                if (result) {
                    console.log("srch res categories", result);
                    callback(result);
                } else {
                    console.log('ERROR categories', error);
                    callback([]);
                }
            });
    });

    // end category table

    socket.on('disconnect', () => {
        console.log('user disconnected!');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}.`);
});

