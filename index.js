const inquirer = require('inquirer');
const db = require('./db/connection');

db.connect(err => {
    if (err) throw err;
    console.log('Database connected');
    tracker();
});

var tracker = function () {
    inquirer.prompt([{
        type: 'list',
        name: 'prompt',
        message: 'What would you like to do?',
        choices: 
        [
        'View ALL Department', 
        'View ALL Roles', 
        'View ALL Employees', 
        'Add A Department', 
        'Add A Role', 
        'Add An Employee', 
        'Update An Employee Role',
        'Remove An Employee',
        'Log Out'
        ]
    }]).then((answers) => {
        if (answers.prompt === 'View ALL Department') {
            db.query(`SELECT * FROM department`, (err, result) => {
                if (err) throw err;
                console.log('Viewing ALL Deparment: ');
                console.table(result);
                tracker();
            }); // Prompt's working but results aren´t showing in any options, maybe tables are not being read
        } else if (answers.prompt === 'View ALL Roles') {
            db.query(`SELECT * FROM role`, (err, result) => {
                if (err) throw err;
                console.log('Viewing ALL Roles: ');
                console.table(result);
                tracker();
            })
        } else if (answers.prompt === 'View ALL Employees') {
            db.query(`SELECT * FROM employee`, (err, result) => {
                if (err) throw err;
                console.log('Viewing ALL Employees: ');
                console.table(result);
                tracker();
            });
        } else if (answers.prompt === 'Add A Department') {
            inquirer.prompt([{
                type: 'input',
                name: 'department',
                message: 'What is the name of the department?',
                validate: departmentInput => {
                    if (departmentInput) {
                        return true;
                    } else {
                        console.log('Please Add a Department!');
                        return false;
                    }
                }
            }]).then ((answers) => {
                db.query(`INSERT INTO department (name) VALUES (?)`, [answers.department], (err, result) => {
                    if (err) throw err;
                    console.log(`Added ${answers.department} to the database.`)
                    tracker();
                });
            })
        } else if (answers.prompt === 'Add A Role') {
            db.query(`SELECT * FROM department`, (err, result) => {
                if (err) throw err;
                    inquirer.prompt([{
                        type: 'input',
                        name: 'role',
                        message: 'What is the name of the role?',
                        validate: roleInput => {
                            if (roleInput) {
                                return true;
                            } else {
                                console.log('Please Add A Role!');
                                return false;
                            }
                        }
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary of the role?',
                        validate: salaryInput => {
                            if (salaryInput) {
                                return true;
                            } else {
                                console.log('Please Add A Salary!');
                                return false;
                            }
                        }
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department does the role belong to?',
                        choices: () => {
                            var array = [];
                            for (var i = 0; i < result.length; i++) {
                                array.push(result[i].name);
                            }
                            return array;
                        }
                    }
                ]).then ((answers) => {
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].name === answers.department) {
                            var department = result[i];
                        }
                    }
                    db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [answers.role, answers.salary, department.id], (err, result) => {
                        if (err) throw err;
                        console.log(`Added ${answers.role} to the database.`)
                        tracker();
                    });
                })
            });
        } else if (answers.prompt === 'Add An Employee') {
            db.query(`SELECT title name, id value FROM role`, (err, result) => {
            db.query(`SELECT concat (first_name, ' ', last_name) name, id value FROM employee`, (err, employeeResult) => {
                if (err) throw err;
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'firstName',
                            message: 'What is the employees first name?',
                            validate: firstNameInput => {
                                if (firstNameInput) {
                                    return true;
                                } else {
                                    console.log('Please Add A First Name!');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'input',
                            name: 'lastName',
                            message: 'What is the employees last name?',
                            validate: lastNameInput => {
                                if (lastNameInput) {
                                    return true;
                                } else {
                                    console.log('Please Add A Last Name!');
                                    return false;
                                }
                            }
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: 'What is the employees role?',
                            choices: result
                        },
                        {
                            type: 'list',
                            name: 'manager',
                            message: 'Who is the employees manager?',
                            choices: employeeResult
                        }
                    ]).then((answers) => {
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].title === answers.role) {
                                var role = result[i];
                            }
                        }
                        db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, answers.role, answers.manager], (err, result) => {
                            if (err) throw err;
                            console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`)
                            tracker();
                        });
                    })
            })    
                
            });
        } else if (answers.prompt === 'Update An Employee Role') {
            db.query(`SELECT title name, id value FROM role`, (err, result) => {
            db.query(`SELECT concat (first_name, ' ', last_name) name, id value FROM employee`, (err, employeeName) => {
                if (err) throw err;
                    inquirer.prompt([{
                        type: 'list',
                        name: 'employee',
                        message: 'Which employees role do you want to update?',
                        choices: employeeName
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is their new role?',
                        choices: result
                    }
                ]).then((answers) => {
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].last_name === answers.employee) {
                            var name = result[i];
                        }
                    }
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].title === answers.role) {
                            var role = result[i];
                        }
                    }
                    db.query(`UPDATE employee SET ? WHERE ?`, [{role_id: answers.role}, {id: answers.employee}], (err, result) => {
                        if (err) throw err;
                        console.log(`Update ${answers.employee} role to the database.`)
                        tracker();
                    });
                })
            });
            })
                
        } else if (answers.prompt === 'Remove An Employee') {
            db.query(`SELECT title name, id value FROM role`, (err, result) => {
            db.query(`SELECT concat (first_name, ' ', last_name) name, id value FROM employee`, (err, employeeResult) => {
                if (err) throw err;
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'employee',
                            message: 'Who is the employees you want to remove?',
                            choices: employeeResult
                        }
                    ]).then((answers) => {
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].title === answers.role) {
                                var role = result[i];
                            }
                        }
                        db.query(`DELETE FROM employee WHERE name=employee;`, [answers.firstName, answers.lastName, answers.role, answers.manager], (err, result) => {
                            if (err) throw err;
                            console.log(`Added ${answers.firstName} ${answers.lastName} to the database.`)
                            tracker();
                        });
                    })
                })
            })
        } else if (answers.prompt === 'Log Out') {
            db.end();
            console.log('Good-Bye!');
        }
    })
};

