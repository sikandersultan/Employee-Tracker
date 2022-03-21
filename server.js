
const mysql = require('mysql2')
const inquirer = require('inquirer')
const cTable = require('console.table') 

require('dotenv').config()

// if you have a password do add it here, i dont so i had to remove it
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'employee_db'
})

connection.connect(err => {
  if (err) throw err
  console.log("Connection successful as" + connection.threadId)
  promptUser()
})


const promptUser = () => {
  inquirer.prompt ([
    {
      type: "list",
      name: "choices", 
      message: "Choose one of the following options to continue:",
      choices: ["View all departments", 
                "View all roles", 
                "View all employees", 
                "Add a department", 
                "Add a role", 
                "Add an employee", 
                "Update an employee role",
                ]
    }
  ])
    .then((answers) => {
      const { choices } = answers 

      if (choices === "View all departments") {
        departments()
      }

      if (choices === "View all roles") {
        roles()
      }

      if (choices === "View all employees") {
        employees()
      }

      if (choices === "Add a department") {
        addDepartment()
      }

      if (choices === "Add a role") {
        addRole()
      }

      if (choices === "Add an employee") {
        addEmployee()
      }

      if (choices === "Update an employee role") {
        update()
      }
  })
}

departments = () => {
  console.log('Showing all departments...\n')
  const sql = `SELECT department.id AS id, department.name AS department FROM department` 

  connection.query(sql, (err, rows) => {
    if (err) throw err
    console.table(rows)
    promptUser()
  })
}

roles = () => {
  console.log('Showing all roles...\n')

  const sql = `SELECT role.id, role.title, department.name AS department
               FROM role
               INNER JOIN department ON role.department_id = department.id`
  
  connection.query(sql, (err, rows) => {
    if (err) throw err 
    console.table(rows) 
    promptUser()
  })
}

employees = () => {
  console.log('Showing all employees...\n') 
  const sql = `SELECT employee.id, 
                      employee.first_name, 
                      employee.last_name, 
                      role.title, 
                      department.name AS department,
                      role.salary, 
                      CONCAT (manager.first_name, " ", manager.last_name) AS manager
               FROM employee
                      LEFT JOIN role ON employee.role_id = role.id
                      LEFT JOIN department ON role.department_id = department.id
                      LEFT JOIN employee manager ON employee.manager_id = manager.id`

  connection.query(sql, (err, rows) => {
    if (err) throw err 
    console.table(rows)
    promptUser()
  })
}

addDepartment = () => {
  inquirer.prompt([
    {
      type: 'input', 
      name: 'newDepartment',
      message: "What department do you want to add?",
    }
  ])
    .then(answer => {
      const sql = `INSERT INTO department (name)
                  VALUES (?)`
      connection.query(sql, answer.newDepartment, (err, res) => {
        if (err) throw err
        console.log('Added ' + answer.newDepartment + " to departments!") 

        departments()
    })
  })
}

addRole = () => {
  inquirer.prompt([
    {
      type: "input", 
      name: "role",
      message: "What role do you want to add?",
    },
    {
      type: 'input', 
      name: 'salary',
      message: "What is the salary of this role?",
    }
  ])
    .then(answer => {
      const params = [answer.role, answer.salary]

      const roleSql = `SELECT name, id FROM department` 

      connection.query(roleSql, (err, data) => {
        if (err) throw err 
    
        const dept = data.map(({ name, id }) => ({ name: name, value: id }))

        inquirer.prompt([
        {
          type: 'list', 
          name: 'dept',
          message: "What department is this role in?",
          choices: dept
        }
        ])
          .then(deptChoice => {
            const dept = deptChoice.dept
            params.push(dept)

            const sql = `INSERT INTO role (title, salary, department_id)
                        VALUES (?, ?, ?)`

            connection.query(sql, params, (err, result) => {
              if (err) throw err
              console.log('Added' + answer.role + " to roles!") 

              roles()
       })
     })
   })
 })
}

addEmployee = () => {
  inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the employee's first name?",
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the employee's last name?",
    }
  ])
    .then(answer => {
    const params = [answer.firstName, answer.lastName]

    const roleSql = `SELECT role.id, role.title FROM role`
  
    connection.query(roleSql, (err, data) => {
      if (err) throw err 
      
      const roles = data.map(({ id, title }) => ({ name: title, value: id }))

      inquirer.prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roles
            }
          ])
            .then(roleChoice => {
              const role = roleChoice.role
              params.push(role)

              const managerSql = `SELECT * FROM employee`

              connection.query(managerSql, (err, data) => {
                if (err) throw err

                const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }))

                inquirer.prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers
                  }
                ])
                  .then(managerChoice => {
                    const manager = managerChoice.manager
                    params.push(manager)

                    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`

                    connection.query(sql, params, (err, result) => {
                    if (err) throw err
                    console.log("Employee has been added!")

                    employees()
              })
            })
          })
        })
     })
  })
}

update = () => {

  const employeeSql = `SELECT * FROM employee`

  connection.query(employeeSql, (err, data) => {
    if (err) throw err 

  const employees = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }))

    inquirer.prompt([
      {
        type: "list",
        name: "name",
        message: "Who would you like to update?",
        choices: employees
      }
    ])
      .then(choice => {
        const employee = choice.name
        const params = [] 
        params.push(employee)

        const roleSql = `SELECT * FROM role`

        connection.query(roleSql, (err, data) => {
          if (err) throw err 

          const roles = data.map(({ id, title }) => ({ name: title, value: id }))
          
            inquirer.prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles
              }
            ])
                .then(roleChoice => {
                const role = roleChoice.role
                params.push(role) 
                
                let employee = params[0]
                params[0] = role
                params[1] = employee 

                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`

                connection.query(sql, params, (err, result) => {
                  if (err) throw err
                console.log("Employee has been updated!")
          })
        })
      })
    })
  })
}
