DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(255),
    password VARCHAR(255),
    catchphrase TEXT,
    picture VARCHAR(255)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    comment TEXT,
    author VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, username, password, catchphrase, picture) VALUES
(1, 'Finn', '123', 'Will somebody think of the mats?!', 'Hamster.jpg'),
(2, 'Verohallitus', '123', "That's my bike pump.. now", ''),
(3, 'Elintarvikeliitto', '123', "It's good our son doesn't visit more often", '');

INSERT INTO comments (user_id, comment, author) VALUES
(1, 'The microbial mats were here first...', 'Everyone'),
(1, 'Yes they were', 'Finn');