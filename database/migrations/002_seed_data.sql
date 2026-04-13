-- ============================================
-- vezura E-commerce Database - Seed Data
-- Migration: 002_seed_data
-- Description: Populates database with initial configuration data
-- ============================================

-- ============================================
-- 1. INSERT SHIPPING ZONES
-- ============================================

-- Metro Zone (Major cities with better connectivity)
INSERT INTO shipping_zones (id, zone_name, description, cities, pincode_ranges, is_active) VALUES
(1, 'Metro Zone', 'Major metro cities with fastest delivery',
 '["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune"]',
 '[["400000", "400100"], ["110000", "110100"], ["560000", "560100"], ["500000", "500100"], ["600000", "600100"], ["700000", "700100"], ["410000", "410100"]]',
 true);

-- Tier 2 Zone (Other major cities)
INSERT INTO shipping_zones (id, zone_name, description, cities, pincode_ranges, is_active) VALUES
(2, 'Tier 2 Zone', 'Major cities outside metros',
 '["Ahmedabad", "Surat", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Coimbatore"]',
 NULL,
 true);

-- Rest of India Zone
INSERT INTO shipping_zones (id, zone_name, description, cities, pincode_ranges, is_active) VALUES
(3, 'Rest of India', 'All other serviceable locations',
 NULL,
 NULL,
 true);

-- ============================================
-- 2. INSERT SHIPPING CARRIERS
-- ============================================

INSERT INTO shipping_carriers (id, name, api_endpoint, is_active, supports_cod, estimated_days_base) VALUES
(1, 'Standard Shipping', NULL, true, true, 5),
(2, 'Express Delivery', NULL, true, true, 3),
(3, 'Bluedart', 'https://api.bluedart.com', true, true, 2),
(4, 'Delhivery', 'https://track.delhivery.com/api', true, true, 3),
(5, 'Shiprocket', 'https://apiv2.shiprocket.in', true, true, 4);

-- ============================================
-- 3. INSERT SHIPPING METHODS
-- ============================================

INSERT INTO shipping_methods (id, carrier_id, method_name, description, is_active) VALUES
(1, 1, 'Standard Delivery', 'Standard delivery in 5-7 business days', true),
(2, 2, 'Express Delivery', 'Express delivery in 3-4 business days', true),
(3, 4, 'Delhivery Standard', 'Delivered by Delhivery in 4-5 days', true),
(4, 4, 'Delhivery Express', 'Express delivery by Delhivery in 2-3 days', true);

-- ============================================
-- 4. INSERT DELIVERY CHARGE RULES
-- ============================================

-- Metro Zone - Standard Delivery
INSERT INTO delivery_charge_rules
(zone_id, method_id, min_order_amount, max_order_amount, base_charge, free_shipping_above, cod_charge, is_active, priority)
VALUES
-- Free delivery above ₹699
(1, 1, 0, 699, 49, 699, 0, true, 1),
-- ₹49 for orders below ₹699
(1, 1, 0, 699, 49, NULL, 0, true, 1),
-- Free delivery above ₹699

-- Metro Zone - Express Delivery
INSERT INTO delivery_charge_rules
(zone_id, method_id, min_order_amount, max_order_amount, base_charge, free_shipping_above, cod_charge, is_active, priority)
VALUES
(1, 2, 0, 999, 79, 999, 0, true, 2);

-- Tier 2 Zone - Standard Delivery
INSERT INTO delivery_charge_rules
(zone_id, method_id, min_order_amount, max_order_amount, base_charge, free_shipping_above, cod_charge, is_active, priority)
VALUES
(2, 1, 0, 999, 69, 999, 0, true, 1);

-- Tier 2 Zone - Express Delivery
INSERT INTO delivery_charge_rules
(zone_id, method_id, min_order_amount, max_order_amount, base_charge, free_shipping_above, cod_charge, is_active, priority)
VALUES
(2, 2, 0, 1499, 99, 1499, 0, true, 2);

-- Rest of India - Standard Delivery
INSERT INTO delivery_charge_rules
(zone_id, method_id, min_order_amount, max_order_amount, base_charge, free_shipping_above, cod_charge, is_active, priority)
VALUES
(3, 1, 0, 1499, 89, 1499, 0, true, 1);

-- Rest of India - Express Delivery
INSERT INTO delivery_charge_rules
(zone_id, method_id, min_order_amount, max_order_amount, base_charge, free_shipping_above, cod_charge, is_active, priority)
VALUES
(3, 2, 0, 1999, 129, 1999, 0, true, 2);

-- ============================================
-- 5. INSERT MAJOR PINCODES (Sample Data)
-- ============================================

-- Mumbai Pincodes (Metro Zone)
INSERT INTO pincode_serviceability (pincode, city, state, zone_id, is_cod_available, estimated_delivery_days, courier_partners) VALUES
('400001', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('400002', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400003', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400004', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400005', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400050', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('400051', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400052', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400060', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400062', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400070', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400072', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400078', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400079', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400088', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400090', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400091', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400092', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400093', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('400101', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('400102', 'Mumbai', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]');

-- Delhi Pincodes (Metro Zone)
INSERT INTO pincode_serviceability (pincode, city, state, zone_id, is_cod_available, estimated_delivery_days, courier_partners) VALUES
('110001', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('110002', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110003', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery"]'),
('110004', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110005', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery"]'),
('110006', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('110007', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110008', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery"]'),
('110009', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110010', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110011', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery"]'),
('110012', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110013', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('110014', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110015', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery"]'),
('110016', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110017', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('110018', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]'),
('110019', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery"]'),
('110020', 'Delhi', 'Delhi', 1, true, 2, '["Delhivery", "Bluedart"]');

-- Bangalore Pincodes (Metro Zone)
INSERT INTO pincode_serviceability (pincode, city, state, zone_id, is_cod_available, estimated_delivery_days, courier_partners) VALUES
('560001', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560002', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560003', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560004', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560005', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560006', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560007', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560008', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560009', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560010', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560011', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560012', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560013', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560014', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560015', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560016', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560017', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560018', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560019', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560020', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560021', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560022', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560023', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560024', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560025', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560026', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560027', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560028', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560029', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560030', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560032', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560033', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560034', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560035', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560036', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560037', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560038', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560039', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560040', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560041', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560042', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560043', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560044', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560045', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560046', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560047', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560048', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560049', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560050', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560051', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560052', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560053', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560054', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560055', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560056', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560057', 'Bangalore', 'Karnataka', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560058', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560059', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560060', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560061', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560062', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560063', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560064', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560065', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560066', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560067', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560068', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560069', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560070', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560071', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560072', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560073', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560074', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560075', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560076', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560077', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560078', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560079', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560080', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560081', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560082', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560083', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560084', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560085', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560086', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560087', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560088', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560089', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560090', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560091', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560092', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560093', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560094', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560095', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560096', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]'),
('560097', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560098', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('560099', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery", "Bluedart"]'),
('560100', 'Bangalore', 'Karnataka', 1, true, 2, '["Delhivery"]');

-- Hyderabad Pincodes (Metro Zone)
INSERT INTO pincode_serviceability (pincode, city, state, zone_id, is_cod_available, estimated_delivery_days, courier_partners) VALUES
('500001', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500002', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500003', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500004', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500005', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500006', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500007', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500008', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500009', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500010', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500011', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500012', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500013', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500014', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500015', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500016', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500017', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500018', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500019', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500020', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500021', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500022', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500023', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500024', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500025', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500026', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500027', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500028', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500029', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500030', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500031', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500032', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500033', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500034', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500035', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500036', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500037', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500038', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500039', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500040', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500041', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500042', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500043', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500044', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500045', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500046', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500047', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500048', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500049', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500050', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500051', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500052', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500053', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500054', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500055', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500056', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500057', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500058', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500059', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500060', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500061', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500062', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500063', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500064', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500065', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500066', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500067', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500068', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500069', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500070', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500071', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500072', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500073', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500074', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500075', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500076', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500077', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500078', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500079', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500080', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500081', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500082', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500083', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500084', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500085', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500086', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500087', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500088', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500089', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500090', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500091', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500092', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500093', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500094', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500095', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500096', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500097', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('500098', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]'),
('500099', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery"]'),
('500100', 'Hyderabad', 'Telangana', 1, true, 2, '["Delhivery", "Bluedart"]');

-- Pune Pincopes (Metro Zone)
INSERT INTO pincode_serviceability (pincode, city, state, zone_id, is_cod_available, estimated_delivery_days, courier_partners) VALUES
('411001', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411002', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411003', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411004', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411005', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411006', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411007', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411008', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411009', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411010', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411011', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411012', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411013', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411014', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411015', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411016', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411017', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411018', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411019', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411020', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411021', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411022', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411023', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411024', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411025', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411026', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411027', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411028', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411029', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411030', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411031', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411032', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411033', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411034', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411035', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411036', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411037', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411038', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411039', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411040', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411041', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411042', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411043', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411044', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411045', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411046', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411047', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411048', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411049', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411050', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411051', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411052', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411053', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411054', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411055', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411056', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411057', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411058', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411059', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411060', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411061', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411062', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411063', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411064', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411065', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411066', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411067', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411068', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411069', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411070', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411071', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411072', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411073', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411074', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411075', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411076', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411077', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411078', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411079', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411080', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411081', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411082', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411083', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411084', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411085', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411086', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411087', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411088', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411089', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411090', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411091', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411092', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411093', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411094', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411095', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411096', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411097', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart", "Shiprocket"]'),
('411098', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]'),
('411099', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery"]'),
('411100', 'Pune', 'Maharashtra', 1, true, 2, '["Delhivery", "Bluedart"]');

-- ============================================
-- 6. INSERT CATEGORIES
-- ============================================

INSERT INTO categories (id, name, slug, emoji, display_order) VALUES
('1', 'Earrings', 'earrings', '✨', 1),
('2', 'Hamper', 'hamper', '🎁', 2),
('3', 'Rings', 'rings', '💍', 3),
('4', 'Bracelet', 'bracelet', '💎', 4),
('5', 'Necklace', 'necklace', '❤️', 5);

-- ============================================
-- END OF SEED DATA MIGRATION
-- ============================================
