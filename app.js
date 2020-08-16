const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./lib/db_connection');

db.connect((err) => {
    if (err) throw err;
    // start app function with inquirer functions
    displayMainMenu();
});

const displayMainMenu = () => {
    console.clear();
    console.log('=================================');
    console.log('|    EMPLOYEE  MANAGEMENT CLI   |');
    console.log('=================================\n');
    inquirer.prompt([{
            type: "list",
            message: "Select from the menu below.",
            choices: [{
                    name: "View Employees",
                    value: viewEmployees,
                },
                {
                    name: "Add A New Employee",
                    value: addEmployeeMenu
                },
                {
                    name: "Update An Employee's Role",
                    value: updateEmployeeRole
                },
                new inquirer.Separator(),
                {
                    name: "View Employees By Manager",
                    value: viewByManager
                },
                {
                    name: "Update An Employee's Manager",
                    value: updateManager
                },
                new inquirer.Separator(),
                {
                    name: "View Roles",
                    value: viewRoles
                },
                {
                    name: "Add A New Role",
                    value: addRole
                },
                new inquirer.Separator(),
                {
                    name: "View Departments",
                    value: viewDepts
                },
                {
                    name: "View Department Budget",
                    value: viewDeptBudget
                },
                {
                    name: "Add A New Department",
                    value: addDept
                },
                new inquirer.Separator(),
                {
                    name: "Delete An Employee",
                    value: deleteEmployee
                },
                {
                    name: "Delete A Department",
                    value: deleteDept
                },
                {
                    name: "Delete A Role",
                    value: deleteRole
                },
                new inquirer.Separator(),
                {
                    name: "EXIT Program",
                    value: exitProgram
                }
            ],
            name: "mainMenu",
            pageSize: 20,
        }])
        .then(response => {
            response.mainMenu();
        });
};

const addEmployee = (first, last, role, manager) => {

    let queryString = {
        id: 0,
        first_name: first,
        last_name: last,
        role_id: parseInt(role),
        manager_id: (manager === undefined) ? undefined : parseInt(manager)
    };

    db.query(`INSERT INTO employee SET ?`, [queryString], (err, res) => {
            if (err) throw err;
            console.log("Successfully added a new employee");
    })
}

const addEmployeeMenu = () => {
    console.log("\nEnter New Employee Info.");
    console.log("------------------------");

    db.query("SELECT id, title FROM role;", (err, res) => {
        if (err) throw err;
        let roles = res.map(e => {
            return {
                name: `${e.title}`,
                value: e
            }
        });

        db.query("SELECT distinct m.id, m.first_name, m.last_name FROM employee as m JOIN employee as e ON (e.manager_id = m.id) ORDER BY m.id ASC;", (err, res) => {
            if (err) throw err;
            let managers = res.map(e => {
                return {
                    name: `${e.first_name} ${e.last_name}`,
                    value: e
                }
            });
            managers.push({
                value: "NONE"
            });

            inquirer.prompt([{
                    type: "input",
                    message: "Enter the First Name.",
                    name: "first_name",
                },
                {
                    type: "input",
                    message: "Enter the Last Name.",
                    name: "last_name",
                },
                {
                    type: "list",
                    message: "Select employee role.",
                    choices: roles,
                    name: "role_id",
                    pageSize: 20
                },
                {
                    type: "list",
                    message: "Select the employee's Manager.",
                    choices: managers,
                    name: "manager_id"
                },
            ]).then(response => {
                // console.log(response);
                addEmployee(response.first_name, response.last_name, response.role_id.id, response.manager_id.id);
            }).then(() => {
                setTimeout(displayMainMenu, 2000);
            });
        });

    });

}

const addDept = () => {
    console.log("\nAdd New Department");
    console.log("------------------");

    inquirer.prompt([{
        type: "input",
        message: "Enter the New Department Name.",
        name: "name",
    }, ]).then(response => {
        db.query("INSERT INTO department SET ?", [{
            id: 0,
            dept_name: response.name
        }], (err, res) => {
            if (err) throw err;
            console.log("Successfully added a new department");
            setTimeout(displayMainMenu, 2000);
        })
    })
}

const addRole = () => {
    console.log("\nAdd New Role");
    console.log("------------");

    db.query("SELECT id, dept_name FROM department;", (err, res) => {
        if (err) throw err;
        let departments = res.map(e => {
            return {
                name: e.dept_name,
                value: e
            }
        });

        inquirer.prompt([{
                type: "input",
                message: "Enter Name of New Role.",
                name: "title",
            },
            {
                type: "number",
                message: "Enter Salary for New Role. ($)", // validation
                name: "salary",
            },
            {
                type: "list",
                message: "Select Department this Role works in.",
                choices: departments,
                name: "department_id"
            },
        ]).then(response => {
            db.query("INSERT INTO role SET ?", [{
                id: 0,
                title: response.title,
                salary: response.salary,
                department_id: response.department_id.id
            }], (err, res) => {
                if (err) throw err;
                console.log("Successfully added a new role");
                setTimeout(displayMainMenu, 2000);
            })
        })
    })
};

const viewEmployees = () => {
    db.query("SELECT employee.id, first_name, last_name, title, dept_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id",
        (err, res) => {
            if (err) throw err;
            console.clear();
            console.log("*** press UP or DOWN to return to Main Menu ***\n\n");
            console.table(res);
        }
    );
    displayMainMenu();
};

const viewRoles = () => {
    db.query("SELECT role.id, title, salary, dept_name FROM role LEFT JOIN department ON role.department_id = department.id;",
        (err, res) => {
            if (err) throw err;
            console.clear();
            console.log("*** press UP or DOWN to return to Main Menu ***\n\n");
            console.table(res);
        }
    );
    displayMainMenu();
};

const viewDepts = () => {
    db.query("SELECT * FROM department;",
        (err, res) => {
            if (err) throw err;
            console.clear();
            console.log("*** press UP or DOWN to return to Main Menu ***\n\n");
            console.table(res);
        }
    );
    displayMainMenu();
};

const viewByManager = () => {
    console.log("\nView Employees By Manager");
    console.log("-------------------------");

    db.query("SELECT distinct m.id, m.first_name, m.last_name FROM employee as m JOIN employee as e ON (e.manager_id = m.id) ORDER BY m.id ASC;", (err, res) => {
        if (err) throw err;
        let managers = res.map(e => {
            return {
                name: `${e.first_name} ${e.last_name}`,
                value: e
            }
        });

        inquirer.prompt([{
            type: "list",
            message: "Select Manager",
            choices: managers,
            name: "manager",
            pageSize: 100
        }]).then(response => {
            db.query("SELECT employee.id, first_name, last_name, title FROM employee  LEFT JOIN role on employee.role_id = role.id WHERE manager_id = ?;",
                [response.manager.id],
                (err, res) => {
                    if (err) throw err;
                    console.clear();
                    console.log("*** press UP or DOWN to return to Main Menu ***\n\n");
                    console.log(`Employees managed by ${response.manager.first_name} ${response.manager.last_name}`);
                    console.table(res);
                })
            displayMainMenu();
        })
    });
};

const viewDeptBudget = () => {
    console.log("\nGet Department Budget");
    console.log("---------------------");

    db.query("SELECT * FROM department;", (err, res) => {
        if (err) throw err;
        let depts = res.map(e => {
            return {
                name: `Department: ${e.dept_name}`,
                value: e
            }
        });
        inquirer.prompt([{
            type: "list",
            message: "Select Department",
            choices: depts,
            name: "dept",
            pageSize: 100
        }]).then(response => {
            db.query("SELECT employee.id, first_name, last_name, salary, dept_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id WHERE department_id = ?;",
                [response.dept.id], (err, res) => {
                    if (err) throw err;
                    let salaries = res.map(e => Number(e.salary));
                    let salary = salaries.reduce((total, num) => total + num, 0);
                    console.log(`Total budget for ${res[0].dept_name}: $${salary}`);
                });
        }).then(() => {
            displayMainMenu();
        });
    });

};

const updateEmployeeRole = () => {
    console.log("\nUpdate Employee Role");
    console.log("---------------------");

    db.query("SELECT employee.id, first_name, last_name, title FROM employee LEFT JOIN role ON employee.role_id = role.id;", (err, res) => {
        if (err) throw err;
        let employees = res.map(e => {
            return {
                name: `${e.first_name} ${e.last_name}, ${e.title}`,
                value: e
            }
        });

        db.query("SELECT id, title FROM role;", (err, res) => {
            if (err) throw err;
            let roles = res.map(e => {
                return {
                    name: `${e.title}`,
                    value: e
                }
            });

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select Employee to Update",
                    choices: employees,
                    name: "employee",
                    pageSize: 100
                },
                {
                    type: "list",
                    message: "Select Employee's new Role",
                    choices: roles,
                    name: "role",
                    pageSize: 100
                }
            ]).then( response => {
                db.query("UPDATE employee SET ? WHERE ? ", [
                    {
                        role_id: response.role.id
                    },
                    {
                        id: response.employee.id
                    }
                ], (err, res) => {
                    if (err) throw err;
                    console.log(`Successfully updated ${response.employee.first_name} ${response.employee.last_name} to ${response.role.title}`);
                    setTimeout(displayMainMenu, 2000);
                })
            });

        });
    });
};

const updateManager = () => {
    console.log("\nUpdate Employee's Manager");
    console.log("---------------------");

    db.query("SELECT employee.id, first_name, last_name, title FROM employee LEFT JOIN role ON employee.role_id = role.id;", (err, res) => {
        if (err) throw err;
        let employees = res.map(e => {
            return {
                name: `${e.first_name} ${e.last_name}, ${e.title}`,
                value: e
            }
        });

        db.query("SELECT distinct m.id, m.first_name, m.last_name FROM employee as m JOIN employee as e ON (e.manager_id = m.id) ORDER BY m.id ASC;", (err, res) => {
            if (err) throw err;
            let managers = res.map(e => {
                return {
                    name: `${e.first_name} ${e.last_name}`,
                    value: e
                }
            });

            managers.push( { value: "NONE" });

            inquirer.prompt([
                {
                    type: "list",
                    message: "Select Employee to Update",
                    choices: employees,
                    name: "employee",
                    pageSize: 100
                },
                {
                    type: "list",
                    message: "Select Employee's new Manager",
                    choices: managers,
                    name: "manager",
                    pageSize: 100
                }
            ]).then( response => {
                db.query("UPDATE employee SET ? WHERE ? ", [
                    {
                        manager_id: (response.manager === "NONE") ? undefined : response.manager.id
                    },
                    {
                        id: response.employee.id
                    }
                ], (err, res) => {
                    if (err) throw err;
                    console.log(`${response.employee.first_name} ${response.employee.last_name} is now managed by ${response.manager.first_name} ${response.manager.last_name}`);
                    setTimeout(displayMainMenu, 2000);
                })
            });

        });
    });
};

const deleteEmployee = () => {
    console.log("\nDelete An Employee");
    console.log("------------------");

    db.query("SELECT employee.id, first_name, last_name, title, dept_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id",
        (err, res) => {
            if (err) throw err;
            let employees = res.map(e => {
                return {
                    name: `Name: ${e.first_name} ${e.last_name} | Title: ${e.title} | Department: ${e.dept_name}`,
                    value: e
                }
            })

            inquirer.prompt([{
                type: "list",
                message: "Select Employee to Delete",
                choices: employees,
                name: "employee",
                pageSize: 100
            }]).then(response => {
                db.query("DELETE FROM employee WHERE ?", [{
                    id: response.employee.id
                }], (err, res) => {
                    if (err) throw err;
                    console.log(`You removed ${response.employee.first_name} ${response.employee.last_name}`);
                    setTimeout(displayMainMenu, 2000);
                })
            }); // update Manager if deleted employee is a manager
        }
    );
};

const deleteRole = () => {
    console.log("\nDelete A Role");
    console.log("-------------");

    db.query("SELECT role.id, title, salary, dept_name FROM role LEFT JOIN department ON role.department_id = department.id;",
        (err, res) => {
            if (err) throw err;
            let roles = res.map(e => {
                return {
                    name: `Role: ${e.title} | Salary: ${e.salary} | Department: ${e.dept_name}`,
                    value: e
                }
            })

            inquirer.prompt([{
                type: "list",
                message: "Select Role to Delete",
                choices: roles,
                name: "role",
                pageSize: 100
            }]).then(response => {
                db.query("DELETE FROM role WHERE ?", [{
                    id: response.role.id
                }], (err, res) => {
                    if (err) throw err;
                    console.log(`You removed ${response.role.title}`);
                    setTimeout(displayMainMenu, 2000);
                })
            }); // update Employer role_id if role is deleted
        }
    );
};

const deleteDept = () => {
    console.log("\nDelete A Department");
    console.log("-------------------");

    db.query("SELECT * FROM department;",
        (err, res) => {
            if (err) throw err;
            let depts = res.map(e => {
                return {
                    name: `Department: ${e.dept_name}`,
                    value: e
                }
            })

            inquirer.prompt([{
                type: "list",
                message: "Select Department to Delete",
                choices: depts,
                name: "dept",
                pageSize: 100
            }]).then(response => {
                db.query("DELETE FROM department WHERE ?", [{
                    id: response.dept.id
                }], (err, res) => {
                    if (err) throw err;
                    console.log(`You removed ${response.dept.dept_name}`);
                    setTimeout(displayMainMenu, 2000);
                })
            }); // update Employer and Role if department is deleted
        }
    );
};

const exitProgram = () => {
    db.end();
    process.exit(0);
}