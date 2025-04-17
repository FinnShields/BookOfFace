DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
(1, 'Finn', '123', 'I love programming! It''s super fun.', 'fshields.jpg'),
(2, 'Tomi', '123', 'Panic Art Studios is the best!', 'tomi.png'),
(3, 'Ninja', '123', 'Meoowww', 'Ninja.jpeg'),
(4, 'Balcony Pigeon', '123', 'I WILL make my nest here, no matter what you do..', 'Pigeon.jpeg');

INSERT INTO comments (user_id, comment, author) VALUES
(1, 'This guy seems so committed to his craft!', 'Anon'),
(1, 'What an interesting potential intern!', 'Anon'),
(4, 'You can try, but we won''t let you...', 'Finn');