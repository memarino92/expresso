const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menuitems');

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
    db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.menu = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.send({menus: rows});
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    const menu = req.body.menu;
    if (menu.title) {
        db.run(`INSERT INTO Menu (title) VALUES ('${menu.title}')`, function(err){
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
                    if (err) {
                        next(err);
                    } else {
                        res.status(201).send({menu: row});
                    }
                });
            }
        });
    } else {
        res.status(400).send();
    }
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.send({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
    const menu = req.body.menu;
    if (menu.title) {
        db.run(`UPDATE Menu SET title = '${menu.title}' WHERE id = ${req.params.menuId}`, (err) => {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, row) => {
                    if (err) {
                        next(err);
                    } else {
                        res.send({menu: row});
                    }
                });
            }
        });
    } else {
        res.status(400).send();
    }
});

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, err => {
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            });
        }
    });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

module.exports = menusRouter;