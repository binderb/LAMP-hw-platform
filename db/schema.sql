DROP DATABASE IF EXISTS hw_db;
CREATE DATABASE hw_db;

USE hw_db;

CREATE TABLE user_table (
  user_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  first TEXT NOT NULL,
  last TEXT NOT NULL,
  class_id TEXT NOT NULL,
  pswd TEXT NOT NULL,
  aux TEXT NOT NULL,
  access TEXT NOT NULL,
  active BOOLEAN NOT NULL
);

CREATE TABLE class_table (
  class_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT 1 NOT NULL,
  archived BOOLEAN DEFAULT 0 NOT NULL
);

CREATE TABLE assignment_table (
  assignment_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  class_id INT NOT NULL,
  name TEXT NOT NULL,
  created DATETIME NOT NULL,
  available DATETIME NOT NULL,
  due DATETIME NOT NULL,
  graded BOOLEAN DEFAULT 0 NOT NULL,
  extensions TEXT NOT NULL,
  FOREIGN KEY (class_id)
  REFERENCES class_table(class_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);

CREATE TABLE question_table (
  question_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  question_tags TEXT NOT NULL,
  question_title TEXT NOT NULL,
  question_data TEXT NOT NULL
);

CREATE TABLE assignment_questions (
  mapping_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_id INT NOT NULL,
  question_index INT NOT NULL,
  question_points INT NOT NULL,
  FOREIGN KEY (assignment_id)
  REFERENCES assignment_table(assignment_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (question_id)
  REFERENCES question_table(question_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);

CREATE TABLE question_types (
  type_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE response_table (
  response_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_index INT NOT NULL,
  user_id INT NOT NULL,
  response_data TEXT NOT NULL,
  FOREIGN KEY (assignment_id)
  REFERENCES assignment_table(assignment_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (user_id)
  REFERENCES user_table(user_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);

CREATE TABLE score_table (
  score_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  assignment_id INT NOT NULL,
  question_index INT NOT NULL,
  user_id INT NOT NULL,
  score FLOAT(2) NOT NULL,
  feedback_data TEXT NOT NULL,
  FOREIGN KEY (assignment_id)
  REFERENCES assignment_table(assignment_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE,
  FOREIGN KEY (user_id)
  REFERENCES user_table(user_id)
  ON DELETE CASCADE
  ON UPDATE CASCADE
);

CREATE TABLE activation_keys (
  key_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  key_string VARCHAR(100) NOT NULL,
  key_timestamp INT NOT NULL
);

CREATE TABLE password_reset_keys (
  key_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  key_string VARCHAR(100) NOT NULL,
  key_timestamp INT NOT NULL
);