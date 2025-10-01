use test;

-- users, roles, user_roles
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  auth0_user_id VARCHAR(128) UNIQUE,
  username VARCHAR(64) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  status ENUM('active','inactive') DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- semesters
CREATE TABLE semesters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- students, teachers
CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  student_code VARCHAR(32) NOT NULL UNIQUE,
  gpa DECIMAL(3,2),
  total_credits INT,
  cohort_year INT,
  class_name VARCHAR(64),
  phone VARCHAR(32),
  dob DATE,
  gender ENUM('male','female','other'),
  status ENUM('active','inactive','graduated') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE student_semesters (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,
  gpa DECIMAL(3,2),
  total_credits INT,
  status ENUM('enrolled','suspended','completed') DEFAULT 'enrolled',
  UNIQUE (student_id, semester_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE teachers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  teacher_code VARCHAR(32) UNIQUE,
  title VARCHAR(64),
  office VARCHAR(64),
  phone VARCHAR(32),
  email VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE teacher_availability (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,
  max_supervisees INT DEFAULT 0,
  max_reviewers INT DEFAULT 0,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(32),
  is_open BOOLEAN DEFAULT TRUE,
  note VARCHAR(255),
  UNIQUE (teacher_id, semester_id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- topics and pre-thesis
CREATE TABLE topics (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  tags JSON,
  max_slots INT NOT NULL,
  status ENUM('open','closed') DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE topic_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  topic_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status ENUM('pending','accepted','rejected','cancelled') DEFAULT 'pending',
  note VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME,
  UNIQUE (topic_id, student_id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE pre_thesis_projects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL UNIQUE,
  topic_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,
  supervisor_teacher_id BIGINT NOT NULL,
  status ENUM('ongoing','completed','cancelled') DEFAULT 'ongoing',
  final_score DECIMAL(5,2),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (supervisor_teacher_id) REFERENCES teachers(id)
);

-- thesis
CREATE TABLE thesis_registrations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  supervisor_teacher_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,
  title VARCHAR(255),
  abstract TEXT,
  status ENUM('submitted','pending_approval','approved','rejected') DEFAULT 'submitted',
  submitted_by_teacher_id BIGINT NOT NULL,
  approved_by_user_id BIGINT,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at DATETIME,
  UNIQUE (student_id, semester_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (supervisor_teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (submitted_by_teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
);

CREATE TABLE theses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL UNIQUE,
  supervisor_teacher_id BIGINT NOT NULL,
  semester_id BIGINT NOT NULL,
  title VARCHAR(255),
  abstract TEXT,
  status ENUM('draft','in_progress','defense_scheduled','completed','cancelled') DEFAULT 'in_progress',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (supervisor_teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

CREATE TABLE thesis_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  thesis_id BIGINT NOT NULL,
  teacher_id BIGINT NOT NULL,
  role ENUM('reviewer','committee_member','chair','secretary','member') NOT NULL,
  assigned_by_user_id BIGINT NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (thesis_id, teacher_id, role),
  FOREIGN KEY (thesis_id) REFERENCES theses(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
);

CREATE TABLE defense_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  thesis_id BIGINT NOT NULL UNIQUE,
  scheduled_at DATETIME NOT NULL,
  room VARCHAR(64),
  status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
  notes VARCHAR(255),
  FOREIGN KEY (thesis_id) REFERENCES theses(id)
);

CREATE TABLE thesis_evaluations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  thesis_id BIGINT NOT NULL,
  evaluator_teacher_id BIGINT NOT NULL,
  role ENUM('supervisor','reviewer','committee') NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  comments TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thesis_id) REFERENCES theses(id),
  FOREIGN KEY (evaluator_teacher_id) REFERENCES teachers(id)
);

CREATE TABLE thesis_final_grades (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  thesis_id BIGINT NOT NULL UNIQUE,
  final_score DECIMAL(5,2) NOT NULL,
  computed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (thesis_id) REFERENCES theses(id)
);

-- content, notifications, files
CREATE TABLE announcements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  audience ENUM('all','students','teachers') DEFAULT 'all',
  audience_filter JSON,
  published_by_user_id BIGINT NOT NULL,
  published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  visible_until DATETIME,
  FOREIGN KEY (published_by_user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(64),
  title VARCHAR(255),
  content TEXT,
  entity_type VARCHAR(64),
  entity_id BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE attachments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type ENUM('topic','pre_thesis_project','thesis','submission','announcement') NOT NULL,
  entity_id BIGINT NOT NULL,
  file_url VARCHAR(1024) NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(128),
  uploaded_by_user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);

CREATE TABLE submissions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type ENUM('pre_thesis_project','thesis') NOT NULL,
  entity_id BIGINT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  file_url VARCHAR(1024) NOT NULL,
  uploaded_by_user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);