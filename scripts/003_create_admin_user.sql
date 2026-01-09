-- Create a default admin user
-- Password: admin123

INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'admin@gmail.com',
  '$2a$10$X8qKZvN3J8h7qKt.OQqRxeF1zMVm4VhZRmhL1WQE5UmPKkJ3zHG7K',
  'Admin User',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
