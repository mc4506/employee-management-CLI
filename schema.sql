-- DROP DATABASE IF EXISTS employees_DB;
CREATE DATABASE employees_DB;
USE employees_DB;

CREATE TABLE department (
    id INT AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    primary key (id)
);

CREATE TABLE role (
    id INT AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(7,2) NOT NULL,
    department_id INT NOT NULL,
    primary key (id)
);

CREATE TABLE employee (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT
);
