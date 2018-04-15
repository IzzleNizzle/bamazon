--  Creating and using bamazon Database
DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;
USE bamazon;

-- Create a table for products
CREATE TABLE products (
  item_id INT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);