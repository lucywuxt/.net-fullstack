create database shoppingDB;

use shoppingDB

create table Products
(
	pID int primary key,
	pName varchar(25),
	pCategory varchar(25),
	pPrice decimal,
	pQty int,
	pIsInStock bit,
)

insert into Products (pId, pName, pCategory, pPrice, pQty, pIsInStock)
values
(1, 'Coke', 'Soda', 20, 300, 1),
(2, 'Sprite', 'Soda', 15, 150, 1),
(3, 'Nike', 'Shoes', 400, 50, 1),
(4, 'iPhone 18', 'Technology', 1000, 0, 0),
(5, 'Xbox', 'Technology', 700, 100, 1),
(6, 'Oreos', 'Snacks', 10, 500, 1),
(7, 'Gatorade', 'Sports Drinks', 18, 0, 0),
(8, 'Powerade', 'Sports Drinks', 50, 120, 1),
(9, 'Chips Ahoy', 'Snacks', 30, 0, 0),
(10, 'Adidas', 'Shoes', 100, 50, 1)