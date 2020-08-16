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
                    name: "Update An Employee",
                    value: updateEmployee
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

    let queryString = 
        {
            id: 0,
            first_name: first,
            last_name: last,
            role_id: parseInt(role),
            manager_id: (manager === undefined) ? undefined : parseInt(manager)
        };

    db.query(`INSERT INTO employee SET ?`, [queryString],
    (err, res) => {
        if(err) throw err;
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
            managers.push({value: "NONE"});

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
            }).then( () => {
                setTimeout(displayMainMenu, 2000);
            });
        });

    });

}


const addDept = () => {
    inquirer.prompt([{
            type: "input",
            message: "Enter the New Department Name.",
            name: "name",
        },

    ])
}

const addRole = () => {
    inquirer.prompt([{
            type: "input",
            message: "Enter Name of New Title.",
            name: "title",
        },
        {
            type: "number",
            message: "Enter Salary for New Title. ($)", // validation
            name: "salary",
        },
        {
            type: "list",
            message: "Select Department this Role will work in.",
            choices: [],
            name: "department_id"
        },

    ])
};

const viewEmployees = () => {
    db.query("SELECT employee.id, first_name, last_name, title, dept_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id",
        (err, res) => {
            if (err) throw err;
            console.clear();
            console.table(res);
        });
    displayMainMenu();
};

const viewRoles = () => {
    db.query("SELECT role.id, title, salary, dept_name FROM role LEFT JOIN department ON role.department_id = department.id;",
        (err, res) => {
            if (err) throw err;
            console.clear();
            console.log("*** press UP or DOWN to return to Main Menu ***\n\n");
            console.table(res);
        });
    displayMainMenu();
};

const viewDepts = () => {
    db.query("SELECT * FROM department;",
        (err, res) => {
            if (err) throw err;
            console.clear();
            console.table(res);
        });
    displayMainMenu();
};

const viewByManager = () => {};

const viewDeptBudget = () => {};

const updateEmployee = () => {};

const updateManager = () => {};

const deleteEmployee = () => {};
const deleteRole = () => {};

const deleteDept = () => {};

const exitProgram = () => {
    db.end();
    process.exit(0);
}