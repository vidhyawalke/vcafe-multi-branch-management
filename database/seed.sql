-- Demo branches
INSERT INTO branches (name, location, phone) VALUES
('Panjim Cafe', '18th June Road, Panjim', '+91 90000 11111'),
('Margao Cafe', 'Comba, Margao', '+91 90000 22222'),
('Mapusa Cafe', 'Mapusa Market Road', '+91 90000 33333')
ON CONFLICT DO NOTHING;

-- Demo users
-- Password hash below is for: password123
INSERT INTO users (name, email, password, role, branch_id) VALUES
('BrewHub Admin', 'admin@brewhub.com', '$2b$10$XFDs5qP7KJrX7fM8e6M7UeZ0u0j0Yx5xQvZxqY8f5zV5sQ1vV1l6W', 'ADMIN', 1),
('Cafe Staff', 'staff@brewhub.com', '$2b$10$XFDs5qP7KJrX7fM8e6M7UeZ0u0j0Yx5xQvZxqY8f5zV5sQ1vV1l6W', 'STAFF', 1)
ON CONFLICT (email) DO NOTHING;

INSERT INTO menu_items (name, category, price, branch_id) VALUES
('Cappuccino', 'Coffee', 150, 1),
('Iced Latte', 'Coffee', 170, 1),
('Americano', 'Coffee', 120, 1),
('Paneer Sandwich', 'Food', 180, 1),
('Cheesecake', 'Dessert', 220, 1),
('Cappuccino', 'Coffee', 150, 2),
('Cold Brew', 'Coffee', 180, 2),
('Veg Wrap', 'Food', 160, 2),
('Brownie', 'Dessert', 140, 2),
('Latte', 'Coffee', 150, 3),
('Mocha', 'Coffee', 190, 3),
('Club Sandwich', 'Food', 220, 3),
('Tiramisu', 'Dessert', 240, 3);
