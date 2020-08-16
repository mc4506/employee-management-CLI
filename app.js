const inquirer = require('inquirer');
const cTable = require('console.table');
const db = require('./lib/db_connection');
const util = require('util');

// Promisify mysql connection query
const promiseQuery = util.promisify(db.query).bind(db);

db.connect((err) => {
    if (err) throw err;
    // start app function with inquirer functions
    displayMainMenu();
});

//SQL Queries
const queryRole = "SELECT role.id, title, salary, dept_name FROM role LEFT JOIN department ON role.department_id = department.id;";
// get id, name from employee table sorted in ascending order
const queryManager = "SELECT distinct m.id, m.first_name, m.last_name FROM employee as m JOIN employee as e ON (e.manager_id = m.id) ORDER BY m.id ASC";
// get id and dept name from department table
const queryDept = "SELECT id, dept_name FROM department";
// get get id, name, title and department name  from employee, role, and department tables using join
const queryEmployee = "SELECT employee.id, first_name, last_name, title, dept_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id";

// Async functions to retrive data from DB
const getManagers = async () => {
    try {
        const response = await promiseQuery(queryManager);
        const managers = response.map(e => {
            return {
                name: `${e.first_name} ${e.last_name}`,
                value: e
            }
        });
        managers.push({
            value: "NONE"
        });
        return managers;
    } catch (err) {
        console.log(err);
    }
};

const getRoles = async () => {
    try {
        const response = await promiseQuery(queryRole);
        const roles = response.map(e => {
            return {
                name: `${e.title}`,
                value: e
            }
        });
        return roles;
    } catch (err) {
        console.log(err);
    }
};

const getDepts = async () => {
    try {
        const response = await promiseQuery(queryDept);
        const departments = response.map(e => {
            return {
                name: e.dept_name,
                value: e
            }
        });
        return departments;
    } catch (err) {
        console.log(err);
    }
};

const getEmployees = async () => {
    try {
        const response = await promiseQuery(queryEmployee);
        const employees = response.map(e => {
            return {
                name: `${e.first_name} ${e.last_name}, ${e.title}`,
                value: e
            }
        });
        return employees;
    } catch (err) {
        console.log(err);
    }
};

const backToMainMenu = () => {
    console.log("\n");
    inquirer.prompt([{
        type: "list",
        message: "",
        choices: ["<= Back to Main Menu"],
        name: "back"
    }]).then(response => {
        if (response) displayMainMenu();
    })
}

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

    promiseQuery(`INSERT INTO employee SET ?`, [queryString]);
    console.log("Successfully added a new employee");
}

const addEmployeeMenu = async () => {
    console.log("\nEnter New Employee Info.");
    console.log("------------------------");

    let roles = await getRoles();
    let managers = await getManagers();

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
            pageSize: 100
        },
        {
            type: "list",
            message: "Select the employee's Manager.",
            choices: managers,
            name: "manager_id"
        },
    ]).then(response => {
        addEmployee(response.first_name, response.last_name, response.role_id.id, response.manager_id.id);
    }).then(() => {
        setTimeout(displayMainMenu, 2000);
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
        promiseQuery("INSERT INTO department SET ?", [{
            id: 0,
            dept_name: response.name
        }]).then(() => {
            console.log("Successfully added a new department");
            backToMainMenu();
            // setTimeout(displayMainMenu, 2000);
        })
    })
}

const addRole = async () => {
    console.log("\nAdd New Role");
    console.log("------------");

    const departments = await getDepts();

    await inquirer.prompt([{
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
        promiseQuery("INSERT INTO role SET ?", [{
            id: 0,
            title: response.title,
            salary: response.salary,
            department_id: response.department_id.id
        }]).then(() => {
            console.log("Successfully added a new role");
            backToMainMenu();
            // setTimeout(displayMainMenu, 2000);
        })
    })
};

const viewEmployees = () => {
    promiseQuery(queryEmployee).then(res => {
        console.clear();
        console.log("Employees");
        console.log("---------\n");
        console.table(res);
        backToMainMenu();
    });
};

const viewRoles = () => {
    promiseQuery(queryRole).then(res => {
        console.clear();
        console.log("Employee Roles");
        console.log("--------------\n");
        console.table(res);
        backToMainMenu();
    });
};

const viewDepts = () => {
    promiseQuery(queryDept).then(res => {
        console.clear();
        console.log("Departments");
        console.log("-----------\n");
        console.table(res);
        backToMainMenu();
    });
};

const viewByManager = async () => {
    console.log("\nView Employees By Manager");
    console.log("-------------------------");

    const managers = await getManagers();

    await inquirer.prompt([{
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
                console.log(`Employees managed by ${response.manager.first_name} ${response.manager.last_name}`);
                console.table(res);
                backToMainMenu();
            });
    });
};

const viewDeptBudget = async () => {
    console.log("\nGet Department Budget");
    console.log("---------------------");

    const depts = await getDepts();

    await inquirer.prompt([{
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
                // displayMainMenu();
                backToMainMenu();
            });
    });

};

const updateEmployeeRole = async () => {
    console.log("\nUpdate Employee Role");
    console.log("---------------------");

    const employees = await getEmployees();

    const roles = await getRoles();

    await inquirer.prompt([{
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
    ]).then(response => {
        db.query("UPDATE employee SET ? WHERE ? ", [{
                role_id: response.role.id
            },
            {
                id: response.employee.id
            }
        ], (err, res) => {
            if (err) throw err;
            console.log(`Successfully updated ${response.employee.first_name} ${response.employee.last_name} to ${response.role.title}`);
            // setTimeout(displayMainMenu, 2000);
            backToMainMenu();
        })
    });
};

const updateManager = async () => {
    console.log("\nUpdate Employee's Manager");
    console.log("---------------------");

    const employees = await getEmployees();
    const managers = await getManagers();

    await inquirer.prompt([{
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
    ]).then(response => {
        db.query("UPDATE employee SET ? WHERE ? ", [{
                manager_id: (response.manager === "NONE") ? undefined : response.manager.id
            },
            {
                id: response.employee.id
            }
        ], (err, res) => {
            if (err) throw err;
            console.log(`${response.employee.first_name} ${response.employee.last_name} is now managed by ${response.manager.first_name} ${response.manager.last_name}`);
            // setTimeout(displayMainMenu, 2000);
            backToMainMenu();
        })
    });

};

const deleteEmployee = async () => {
    console.log("\nDelete An Employee");
    console.log("------------------");

    const employees = await getEmployees();

    await inquirer.prompt([{
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
            // setTimeout(displayMainMenu, 2000);
            backToMainMenu();
        })
    });
};

const deleteRole = async () => {
    console.log("\nDelete A Role");
    console.log("-------------");

    const roles = await getRoles();

    await inquirer.prompt([{
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
            // setTimeout(displayMainMenu, 2000);
            backToMainMenu();
        })
    });
};

const deleteDept = async () => {
    console.log("\nDelete A Department");
    console.log("-------------------");

    const depts = await getDepts();

    await inquirer.prompt([{
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
            // setTimeout(displayMainMenu, 2000);
            backToMainMenu();
        })
    });
};

const exitProgram = () => {
    db.end();
    process.exit(0);
}