PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE wardrobe_item (
	id INTEGER NOT NULL, 
	image_url VARCHAR(255) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	created_at DATETIME, 
	PRIMARY KEY (id)
);
COMMIT;
