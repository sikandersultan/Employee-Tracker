INSERT INTO department (name)
VALUES 
('IT'),
('Finance & Accounting'),
('Sales & Marketing'),
('Operations');

INSERT INTO role (title, salary, department_id)
VALUES
('Full Stack Developer', 80000, 1),
('Software Engineer', 120000, 1),
('Accountant', 10000, 2), 
('Finanical Analyst', 150000, 2),
('Marketing Coordindator', 70000, 3), 
('Sales Lead', 90000, 3),
('Project Manager', 100000, 4),
('Operations Manager', 90000, 4);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Best', 'Boi', 1, null),
('Violet', 'Evergarden', 2, null),
('Astolfo', 'Rider', 3, null),
('Rick', 'Sanchez', 4, null),
('Marin', 'Kitagawa', 5, null),
('Eren', 'Yeagerrrrrrrrrrrrrr', 6, null);


