CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(300) NOT NULL,
    status VARCHAR(11) NOT NULL CHECK (status IN ('todo', 'in-progress', 'done')),
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_tasks_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_tasks_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL
);

-- Indexes for common filter/lookup patterns
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
CREATE INDEX idx_tasks_status ON tasks(status);