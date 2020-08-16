const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');

const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.employee = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.send({employees: rows});
        }
    });
});

employeesRouter.post('/', (req, res, next) => {
    const employee = req.body.employee;
    if (employee.name &&
        employee.position &&
        employee.wage) {
            if (!employee.isCurrentEmployee) {
                employee.isCurrentEmployee = 1;
            }
            const { name, position, wage, isCurrentEmployee } = employee;
            db.run(`INSERT INTO Employee (
                name,
                position,
                wage,
                is_current_employee
            ) VALUES (
                '${name}',
                '${position}',
                ${wage},
                ${isCurrentEmployee}
            )`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(201).send({employee: row});
                        }
                    })
                }
            });
        } else {
            res.status(400).send();
        }
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.send({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    const employee = req.body.employee;
    if (employee.name &&
        employee.position &&
        employee.wage) {
            if (!employee.isCurrentEmployee) {
                employee.isCurrentEmployee = 1;
            }
            const { name, position, wage, isCurrentEmployee } = employee;
            db.run(`UPDATE Employee SET
            name = '${name}',
            position = '${position}',
            wage = ${wage},
            is_current_employee = ${isCurrentEmployee}
            WHERE id = ${req.params.employeeId}`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
                        if (err) {
                            next(err);
                        } else {
                            res.send({employee: row});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    db.run(`UPDATE Employee
    SET is_current_employee = 0
    WHERE id = ${req.params.employeeId}`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.send({employee: row});
                }
            });
        }
    });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

module.exports = employeesRouter;