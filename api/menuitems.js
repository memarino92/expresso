const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router({mergeParams: true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.menuItem = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    let menuItemsArray = [];
    db.each(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, row) => {
        if (err) {
            next(err);
        } else {
            menuItemsArray.push(row);
        }
    }, (err, numRows) => {
        if (err) {
            next(err);
        } else {
            res.send({'menuItems': menuItemsArray});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    const menuItem = req.body.menuItem;
    if (menuItem.name &&
        menuItem.inventory &&
        menuItem.price) {
            if (!menuItem.description) {
                menuItem.description = '';
            }
            if (!menuItem.menuId) {
                menuItem.menuId = req.params.menuId;
            }
            const { name, description, inventory, price, menuId } = menuItem;
            db.run(`INSERT INTO MenuItem (
                name,
                description,
                inventory,
                price,
                menu_id
            ) VALUES (
                '${name}',
                '${description}',
                ${inventory},
                ${price},
                ${menuId}
            )`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(201).send({menuItem: row});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const menuItem = req.body.menuItem;
    if (menuItem.name &&
        menuItem.inventory &&
        menuItem.price) {
            if (!menuItem.description) {
                menuItem.description = '';
            }
            if (!menuItem.menuId) {
                menuItem.menuId = req.params.menuId;
            }
            const { name, description, inventory, price, menuId } = menuItem;
            db.run(`UPDATE MenuItem SET
            name = '${name}',
            description = '${description}',
            inventory = ${inventory},
            price = ${price},
            menu_id = ${menuId}
            WHERE id = ${req.params.menuItemId}`, (err) => {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, row) => {
                        if (err) {
                            next(err);
                        } else {
                            res.send({menuItem: row});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = menuItemsRouter;