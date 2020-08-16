const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.run(`CREATE TABLE MenuItem (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    inventory INTEGER NOT NULL,
    price INTEGER NOT NULL,
    menu_id INTEGER NOT NULL,
    FOREIGN KEY(menu_id) REFERENCES Menu(id)
)`);