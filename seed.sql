INSERT INTO department (dept_name) 
VALUES 
("Executives"), -- id 1
("Public Safety"), -- id 2 
("Weapons Development"), -- id 3
("Urban Development"); -- id 4
("Space Program"), -- id 5
("Science and Research Division"), -- id 6
("Turks"); -- id 7

INSERT INTO role (title, salary, department_id)
VALUES 
("President", 1.00, 1), -- id 1
("Vice President", 250000.00, 1), -- id 2
("Head of Public Safety", 200000.00, 2), -- id 3
("Head of Weapons Development", 100000.00, 3), -- id 4
("Head of Urban Development", 90000, 4), -- id 5
("Head of Space Program", 50000, 5), -- id 6
("Head of Science and Research Division", 60000, 6), -- id 7
("Shinra Manager", 150000, 4), -- id 8
("Leader of Turks", 125000, 7), -- id 9
("Turk", 125000, 7), -- id 10
("Soldier 1st Class", 100000, 2), -- id 11
("Soldier 2nd Class", 100000, 2), -- id 12
("Soldier 3rd Class", 100000, 2); -- id 13

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("President", "Shinra", 1, null), -- 1
("Rufus", "Shinra", 2, 1), -- 2
(" ", "Heidegger", 3, 2), -- 3
(" ", "Scarlet", 4, 2), -- 4
("Reeve", "Tuesti", 5, 2), -- 5
(" ", "Palmer", 6, 2), -- 5
("Professor", "Hojo", 7, 2), -- 6
("Generic", "NPC", 8, 5), -- 7
("Tseng", " ", 9, 2), -- 4
("Reno", " ", 10, 9), -- 
("Rude", " ", 10, 9), -- 5
("Elena", " ", 10, 9), -- 5
("Sephiroth", " ", 11, 3), -- 8
("Genesis", "Rhapsodos", 11, 3), -- 9
("Angeal", "Hewley", 11, 3), -- 10
("Zack", "Fair", 11, 3), -- 11
("Roche", " ", 13, 3); -- 11