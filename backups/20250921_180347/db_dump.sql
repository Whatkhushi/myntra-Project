PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE wardrobe_item (
	id INTEGER NOT NULL, 
	image_url VARCHAR(255) NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	created_at DATETIME, subcategory VARCHAR(100), style_tags TEXT, dominant_color_hex VARCHAR(7), emb_index INTEGER, recommendation_id VARCHAR(100), 
	PRIMARY KEY (id)
);
INSERT INTO wardrobe_item VALUES(1,'/uploads/Screenshot 2025-09-20 at 1.13.49 PM.png','dress','2025-09-21T17:53:16.499839','cocktail_dress','"[\"party\", \"elegant\"]"','#ffffff',-1,'custom_000');
INSERT INTO wardrobe_item VALUES(2,'/uploads/Screenshot 2025-09-20 at 12.51.28 PM.png','top','2025-09-21T17:53:16.500164','camisole','"[\"casual\", \"girly\"]"','#ffffff',-1,'custom_001');
INSERT INTO wardrobe_item VALUES(3,'/uploads/Screenshot 2025-09-20 at 1.40.34 PM.png','bag','2025-09-21T17:53:16.500210','tote','"[\"casual\", \"practical\"]"','#ffffff',-1,'custom_002');
INSERT INTO wardrobe_item VALUES(4,'/uploads/Screenshot 2025-09-20 at 1.46.50 PM.png','accessories','2025-09-21T17:53:16.500250','belts','"[\"edgy\", \"classic\"]"','#ffffff',-1,'custom_003');
INSERT INTO wardrobe_item VALUES(5,'/uploads/Screenshot 2025-09-20 at 1.42.33 PM.png','bag','2025-09-21T17:53:16.500281','bucket_bag','"[\"casual\", \"trendy\"]"','#ffffff',-1,'custom_004');
INSERT INTO wardrobe_item VALUES(6,'/uploads/Screenshot 2025-09-20 at 1.07.22 PM.png','dress','2025-09-21T17:53:16.500308','cocktail_dress','"[\"party\", \"elegant\"]"','#ffffff',-1,'custom_005');
INSERT INTO wardrobe_item VALUES(7,'/uploads/Screenshot 2025-09-20 at 12.56.36 PM.png','bottom','2025-09-21T17:53:16.500333','jeans','"[\"casual\", \"denim\"]"','#ffffff',-1,'custom_006');
INSERT INTO wardrobe_item VALUES(8,'/uploads/Screenshot 2025-09-20 at 1.18.25 PM.png','dress','2025-09-21T17:53:16.500360','cocktail_dress','"[\"party\", \"elegant\"]"','#ffffff',-1,'custom_007');
INSERT INTO wardrobe_item VALUES(9,'/uploads/Screenshot 2025-09-20 at 1.35.26 PM.png','accessories','2025-09-21T17:53:16.500384','bracelets','"[\"girly\", \"elegant\"]"','#ffffff',-1,'custom_008');
INSERT INTO wardrobe_item VALUES(10,'/uploads/Screenshot 2025-09-20 at 12.56.48 PM.png','bottom','2025-09-21T17:53:16.500407','jeans','"[\"casual\", \"denim\"]"','#ffffff',-1,'custom_009');
INSERT INTO wardrobe_item VALUES(11,'/uploads/image copy 2.png','bottom','2025-09-21T17:53:16.500429','skirt','"[\"girly\", \"elegant\"]"','#ffffff',-1,'custom_010');
INSERT INTO wardrobe_item VALUES(12,'/uploads/Screenshot 2025-09-20 at 12.35.24 PM.png','top','2025-09-21T17:53:16.500452','t_shirt','"[\"casual\", \"streetwear\"]"','#ffffff',-1,'custom_011');
INSERT INTO wardrobe_item VALUES(13,'/uploads/Screenshot 2025-09-20 at 1.08.20 PM.png','dress','2025-09-21T17:53:16.500475','cocktail_dress','"[\"party\", \"elegant\"]"','#ffffff',-1,'custom_012');
INSERT INTO wardrobe_item VALUES(14,'/uploads/user_20250921_174917_aa063489-a183-4628-9b74-b5a6acb54d1a_aa063489-a183-4628-9b74-b5a6acb54d1a.jpg','dresses','2025-09-21T17:53:16.500498','mini_dress','"[\"girly\"]"','#e7e9e6',14,'item_014');
INSERT INTO wardrobe_item VALUES(15,'/uploads/user_20250921_174920_98d67f32-1c17-4e54-b61e-457331723029_98d67f32-1c17-4e54-b61e-457331723029.jpg','dresses','2025-09-21T17:53:16.500520','mini_dress','"[\"girly\"]"','#e7e9e6',15,'item_015');
INSERT INTO wardrobe_item VALUES(16,'/uploads/62f05ef1-89d3-4d18-96ed-8a8690f6762d.jpg','tops','2025-09-21 12:29:24.374752',NULL,NULL,NULL,NULL,NULL);
INSERT INTO wardrobe_item VALUES(17,'/uploads/0b20a7ff-b2c6-4082-a4a3-d85b87af551c.jpg','tops','2025-09-21 12:30:09.317457',NULL,NULL,NULL,NULL,NULL);
INSERT INTO wardrobe_item VALUES(18,'/uploads/2b67a898-6f4e-451e-bca0-9e68a7be69aa.jpg','tops','2025-09-21 12:30:56.612029','leggings','["minimalist"]','#add9e6',NULL,'user_20250921_180055_bd6cb565');
INSERT INTO wardrobe_item VALUES(19,'/uploads/9d4dd290-1ba3-4596-b9f4-cca480d51d7f.jpg','tops','2025-09-21 12:31:42.312797','shorts','["minimalist"]','#add9e6',NULL,'user_20250921_180141_6d5b56c9');
COMMIT;
