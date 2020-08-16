const express = require('express');
const sqlite3 = require('sqlite3');

const timesheetsRouter = express.Router({mergeParams: true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    db.get(`SELECT * FROM Timesheet WHERE id = ${timesheetId}`, (err, row) => {
        if (err) {
            next(err);
        } else if (row) {
            req.timesheet = row;
            next();
        } else {
            res.status(404).send();
        }
    });
});

timesheetsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.send({timesheets: rows});
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const timesheet = req.body.timesheet;
    if (timesheet.hours &&
        timesheet.rate &&
        timesheet.date) {
            if (!timesheet.employeeId) {
                timesheet.employeeId = req.params.employeeId;
            }
            const { hours, rate, date, employeeId } = timesheet;
            db.run(`INSERT INTO Timesheet (
                hours,
                rate,
                date,
                employee_id
            ) Values (
                ${hours},
                ${rate},
                ${date},
                ${employeeId}
            )`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(201).send({timesheet: row});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

timesheetsRouter.put('/:timesheetId', (req, res,next) => {
    const timesheet = req.body.timesheet;
    if (timesheet.hours &&
        timesheet.rate &&
        timesheet.date) {
            if (!timesheet.employeeId) {
                timesheet.employeeId = req.params.employeeId;
            }
            const { hours, rate, date, employeeId } = timesheet;
            db.run(`UPDATE Timesheet SET
            hours = ${hours},
            rate = ${rate},
            date = ${date},
            employee_id = ${employeeId}
            WHERE id = ${req.params.timesheetId}`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err, row) => {
                        if (err) {
                            next(err);
                        } else {
                            res.send({timesheet: row});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    })
});

module.exports = timesheetsRouter;