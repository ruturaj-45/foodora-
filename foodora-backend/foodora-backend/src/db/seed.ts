/**
 * Seed script — run once after schema.sql
 * npx ts-node src/db/seed.ts
 */
import pool from './connection';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const HASH = (pw: string) => bcrypt.hashSync(pw, 10);

async function seed() {
  const db = await pool.getConnection();
  console.log('Seeding database …');

  // ── Users ───────────────────────────────────────────────────
  const users = [
    { id: 'user-admin-1', name: 'Priya Nair', email: 'admin@foodora.com', phone: '9800000000', password: HASH('admin123'), role: 'admin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
    { id: 'user-rest-1',  name: 'Rahul Verma', email: 'biryanihouse@foodora.com', phone: '9811111111', password: HASH('rest123'), role: 'restaurant', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
    { id: 'user-rest-2',  name: 'Sanjay Kumar', email: 'pizzapalace@foodora.com', phone: '9822222222', password: HASH('rest123'), role: 'restaurant', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
    { id: 'user-rest-3',  name: 'Meena Iyer', email: 'southspice@foodora.com', phone: '9833333333', password: HASH('rest123'), role: 'restaurant', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
    { id: 'user-cust-1',  name: 'Arjun Sharma', email: 'arjun@example.com', phone: '9876543210', password: HASH('customer123'), role: 'customer', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
    { id: 'user-cust-2',  name: 'Sneha Reddy', email: 'sneha@example.com', phone: '8765432100', password: HASH('customer123'), role: 'customer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  ];
  for (const u of users) {
    await db.execute(
      'INSERT IGNORE INTO users (id,name,email,phone,password,role,avatar) VALUES (?,?,?,?,?,?,?)',
      [u.id, u.name, u.email, u.phone, u.password, u.role, u.avatar]
    );
  }

  // ── Addresses ───────────────────────────────────────────────
  await db.execute('INSERT IGNORE INTO addresses (id,user_id,label,line1,line2,city,state,pincode,is_default) VALUES (?,?,?,?,?,?,?,?,?)',
    ['addr-1','user-cust-1','Home','Flat 4B, Sunrise Apartments','Koramangala 5th Block','Bangalore','Karnataka','560034',1]);
  await db.execute('INSERT IGNORE INTO addresses (id,user_id,label,line1,line2,city,state,pincode,is_default) VALUES (?,?,?,?,?,?,?,?,?)',
    ['addr-2','user-cust-1','Work','91Springboard, Koramangala','Near Forum Mall','Bangalore','Karnataka','560095',0]);

  // ── Restaurants ─────────────────────────────────────────────
  const restaurants = [
    { id:'rest-1', owner:'user-rest-1', name:'The Biryani House', desc:'Slow-cooked dum biryani with fragrant basmati rice and secret spice blends.',
      cuisine:'Biryani,Hyderabadi,Mughlai', cover:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&q=80',
      rating:4.8, rc:3210, dtime:'30–35 min', dfee:0, mino:200, price:'₹₹',
      addr:'45, Jubilee Hills, Road No. 36', city:'Hyderabad', offer:'FREE DELIVERY on all orders', tags:'Bestseller,Top Rated' },
    { id:'rest-2', owner:'user-rest-2', name:'Pizza Palace', desc:'Wood-fired artisan pizzas with finest imported cheeses and fresh seasonal toppings.',
      cuisine:'Italian,Pizza,Pasta', cover:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&q=80',
      rating:4.5, rc:1890, dtime:'20–25 min', dfee:40, mino:250, price:'₹₹₹',
      addr:'7, Koregaon Park, Lane 5', city:'Pune', offer:'BUY 1 GET 1 on Weekends', tags:'Trending,Fast Delivery' },
    { id:'rest-3', owner:'user-rest-3', name:'South Spice', desc:'Crispy dosas, fluffy idlis, and flavourful curries from the heart of Tamil Nadu.',
      cuisine:'South Indian,Tamil,Kerala', cover:'https://images.unsplash.com/photo-1630851840633-f96999247032?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1630851840633-f96999247032?w=100&q=80',
      rating:4.6, rc:2890, dtime:'20–30 min', dfee:20, mino:100, price:'₹',
      addr:'56, T Nagar, Anna Salai', city:'Chennai', offer:'₹50 OFF on first order', tags:'Value for Money,Popular' },
    { id:'rest-4', owner:'user-rest-1', name:'Burger Barn', desc:'Juicy smash burgers with fresh patties, house-made sauces, and crispy golden fries.',
      cuisine:'Burgers,American,Sandwiches', cover:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=80',
      rating:4.4, rc:2150, dtime:'15–20 min', dfee:25, mino:150, price:'₹₹',
      addr:'23, Indiranagar, 100 Feet Road', city:'Bangalore', offer:'₹100 OFF on orders above ₹400', tags:'Fast Delivery,Popular' },
    { id:'rest-5', owner:'user-rest-2', name:'Dragon Wok', desc:'Authentic Pan-Asian cuisine blending bold Chinese, Thai and Vietnamese flavors.',
      cuisine:'Chinese,Thai,Pan-Asian', cover:'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=100&q=80',
      rating:4.3, rc:1560, dtime:'25–35 min', dfee:35, mino:200, price:'₹₹',
      addr:'88, New Market, Connaught Place', city:'Delhi', offer:'15% OFF on first order', tags:'New,Trending' },
    { id:'rest-6', owner:'user-rest-1', name:'Spice Villa', desc:'Authentic North Indian cuisine crafted with aromatic spices and traditional recipes.',
      cuisine:'North Indian,Biryani,Mughlai', cover:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&q=80',
      rating:4.7, rc:2340, dtime:'25–30 min', dfee:30, mino:150, price:'₹₹',
      addr:'12, Brigade Road, MG Nagar', city:'Bangalore', offer:'20% OFF on orders above ₹300', tags:'Popular,Trending' },
    { id:'rest-7', owner:'user-rest-3', name:'Sweet Treats', desc:'Indulgent desserts, artisan ice creams and premium mithai crafted with love.',
      cuisine:'Desserts,Bakery,Ice Cream', cover:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=100&q=80',
      rating:4.9, rc:4120, dtime:'20–25 min', dfee:30, mino:100, price:'₹₹',
      addr:'34, Linking Road, Bandra West', city:'Mumbai', offer:'Free Ice Cream on orders above ₹500', tags:'Top Rated,Fan Favourite' },
    { id:'rest-8', owner:'user-rest-2', name:'Green Bowl', desc:'Clean, nutritious meals — salads, smoothie bowls and grain bowls for the health-conscious.',
      cuisine:'Healthy,Salads,Vegan', cover:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      logo:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&q=80',
      rating:4.5, rc:980, dtime:'20–30 min', dfee:40, mino:200, price:'₹₹₹',
      addr:'11, Whitefield, ITPL Main Road', city:'Bangalore', offer:'20% OFF on all orders', tags:'Healthy,Vegan Friendly' },
  ];
  for (const r of restaurants) {
    await db.execute(
      `INSERT IGNORE INTO restaurants
       (id,owner_id,name,description,cuisine,cover_image,logo,rating,rating_count,delivery_time,delivery_fee,min_order,price_range,address,city,status,is_open,offer,tags)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active',1,?,?)`,
      [r.id,r.owner,r.name,r.desc,r.cuisine,r.cover,r.logo,r.rating,r.rc,r.dtime,r.dfee,r.mino,r.price,r.addr,r.city,r.offer,r.tags]
    );
  }

  // ── Menu categories ──────────────────────────────────────────
  const cats: [string, string, string, number][] = [
    ['mc-r1-1','rest-1','Recommended',0],['mc-r1-2','rest-1','Biryani',1],['mc-r1-3','rest-1','Kebabs',2],
    ['mc-r1-4','rest-1','Curries',3],['mc-r1-5','rest-1','Raita & Sides',4],['mc-r1-6','rest-1','Desserts',5],['mc-r1-7','rest-1','Beverages',6],
    ['mc-r2-1','rest-2','Recommended',0],['mc-r2-2','rest-2','Pizzas',1],['mc-r2-3','rest-2','Pasta',2],
    ['mc-r2-4','rest-2','Garlic Breads',3],['mc-r2-5','rest-2','Desserts',4],['mc-r2-6','rest-2','Beverages',5],
    ['mc-r3-1','rest-3','Recommended',0],['mc-r3-2','rest-3','Dosas',1],['mc-r3-3','rest-3','Idli & Vada',2],
    ['mc-r3-4','rest-3','Uttapam',3],['mc-r3-5','rest-3','Rice Meals',4],['mc-r3-6','rest-3','Beverages',5],
    ['mc-r4-1','rest-4','Recommended',0],['mc-r4-2','rest-4','Burgers',1],['mc-r4-3','rest-4','Fries & Sides',2],['mc-r4-4','rest-4','Beverages',3],
    ['mc-r5-1','rest-5','Recommended',0],['mc-r5-2','rest-5','Fried Rice & Noodles',1],['mc-r5-3','rest-5','Mains',2],['mc-r5-4','rest-5','Beverages',3],
    ['mc-r6-1','rest-6','Recommended',0],['mc-r6-2','rest-6','Starters',1],['mc-r6-3','rest-6','Main Course',2],['mc-r6-4','rest-6','Breads',3],['mc-r6-5','rest-6','Desserts',4],
    ['mc-r7-1','rest-7','Recommended',0],['mc-r7-2','rest-7','Ice Cream',1],['mc-r7-3','rest-7','Cakes',2],['mc-r7-4','rest-7','Indian Sweets',3],
    ['mc-r8-1','rest-8','Recommended',0],['mc-r8-2','rest-8','Salad Bowls',1],['mc-r8-3','rest-8','Smoothie Bowls',2],['mc-r8-4','rest-8','Grain Bowls',3],
  ];
  for (const [id, rid, name, sort] of cats) {
    await db.execute('INSERT IGNORE INTO menu_categories (id,restaurant_id,name,sort_order) VALUES (?,?,?,?)', [id, rid, name, sort]);
  }

  // ── Foods ────────────────────────────────────────────────────
  const foods = [
    // Biryani House (rest-1)
    ['food-101','rest-1','Chicken Biryani','Aromatic dum-cooked biryani with tender chicken and saffron.',280,'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80','Biryani','non-veg',4.9,2140,1,1,'["Basmati Rice","Chicken","Saffron","Onions","Mint"]','["Bestseller","Must Try"]'],
    ['food-102','rest-1','Mutton Biryani','Royal mutton biryani layered between fragrant saffron rice.',380,'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80','Biryani','non-veg',4.8,1560,1,1,'["Basmati Rice","Mutton","Saffron","Fried Onions"]','["Premium"]'],
    ['food-103','rest-1','Veg Biryani','Fresh vegetables and paneer in aromatic dum style.',220,'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80','Biryani','veg',4.5,680,0,1,'["Basmati Rice","Vegetables","Paneer"]','["Veg"]'],
    ['food-104','rest-1','Chicken Kebab Platter','Tender seekh kebabs grilled in tandoor, served with mint chutney.',320,'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80','Kebabs','non-veg',4.6,870,0,1,'["Chicken","Spices","Onion","Mint"]','["Starter"]'],
    // Pizza Palace (rest-2)
    ['food-201','rest-2','Margherita Pizza','Classic pizza with San Marzano tomato sauce and mozzarella.',299,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80','Pizzas','veg',4.6,890,0,1,'["Dough","Tomato Sauce","Mozzarella","Basil"]','["Classic","Veg"]'],
    ['food-202','rest-2','Pepperoni Feast','Loaded with premium pepperoni and extra mozzarella.',399,'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80','Pizzas','non-veg',4.8,1120,1,1,'["Dough","Pepperoni","Mozzarella","Jalapeños"]','["Bestseller","Spicy"]'],
    ['food-203','rest-2','Garlic Bread','Freshly baked bread with herb garlic butter and parmesan.',149,'https://images.unsplash.com/photo-1619535860434-cf9b902a0ade?w=600&q=80','Garlic Breads','veg',4.5,670,0,1,'["Bread","Garlic","Butter","Parmesan"]','["Sides","Veg"]'],
    ['food-204','rest-2','Pasta Arrabbiata','Penne in fiery tomato sauce with red chillies and garlic.',269,'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80','Pasta','veg',4.4,430,0,1,'["Penne","Tomato","Red Chillies","Garlic"]','["Veg","Spicy"]'],
    // South Spice (rest-3)
    ['food-301','rest-3','Masala Dosa','Crispy golden dosa filled with spiced potato masala.',120,'https://images.unsplash.com/photo-1630851840633-f96999247032?w=600&q=80','Dosas','veg',4.7,1230,1,1,'["Rice Batter","Potato","Onion","Mustard Seeds"]','["Bestseller","Classic"]'],
    ['food-302','rest-3','Idli (4 Pieces)','Soft steamed rice cakes with coconut chutney and sambar.',80,'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80','Idli & Vada','veg',4.5,890,0,1,'["Rice","Urad Dal","Salt"]','["Healthy","Light"]'],
    ['food-303','rest-3','Vada (2 Pieces)','Crispy medu vada served hot with coconut chutney.',70,'https://images.unsplash.com/photo-1630851840633-f96999247032?w=600&q=80','Idli & Vada','veg',4.4,640,0,1,'["Urad Dal","Chillies","Curry Leaves"]','["Crispy"]'],
    // Burger Barn (rest-4)
    ['food-401','rest-4','Classic Smash Burger','Double smash patty with American cheese and secret sauce.',249,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80','Burgers','non-veg',4.7,1340,1,1,'["Beef Patty","American Cheese","Lettuce","Tomato"]','["Bestseller"]'],
    ['food-402','rest-4','Crispy Chicken Burger','Crispy fried chicken with spicy mayo and coleslaw.',229,'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80','Burgers','non-veg',4.6,980,1,1,'["Chicken","Spicy Mayo","Coleslaw","Pickles"]','["Popular"]'],
    ['food-403','rest-4','Veg Loaded Burger','Crispy vegetable patty with avocado and pesto mayo.',199,'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?w=600&q=80','Burgers','veg',4.3,560,0,1,'["Vegetable Patty","Avocado","Cheese","Mushrooms"]','["Veg"]'],
    // Dragon Wok (rest-5)
    ['food-501','rest-5','Chicken Fried Rice','Wok-tossed jasmine rice with egg and chicken strips.',219,'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80','Fried Rice & Noodles','non-veg',4.5,780,1,1,'["Rice","Chicken","Egg","Spring Onions"]','["Bestseller"]'],
    ['food-502','rest-5','Veg Hakka Noodles','Stir-fried noodles with crispy vegetables.',189,'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80','Fried Rice & Noodles','veg',4.4,540,0,1,'["Noodles","Vegetables","Soy Sauce"]','["Veg"]'],
    ['food-503','rest-5','Chicken Manchurian','Crispy chicken balls in tangy Manchurian sauce.',249,'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80','Mains','non-veg',4.6,690,1,1,'["Chicken","Soy Sauce","Ginger","Garlic"]','["Popular","Spicy"]'],
    // Spice Villa (rest-6)
    ['food-601','rest-6','Chicken Tikka Masala','Tender chicken in rich creamy tomato-based sauce.',320,'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80','Main Course','non-veg',4.8,890,1,1,'["Chicken","Tomato","Cream","Spices"]','["Bestseller","Spicy"]'],
    ['food-602','rest-6','Paneer Tikka','Chunky cottage cheese marinated in spices and grilled.',260,'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80','Starters','veg',4.6,540,1,1,'["Paneer","Bell Peppers","Yoghurt","Spices"]','["Veg","Popular"]'],
    ['food-603','rest-6','Dal Makhani','Slow-cooked black lentils in velvety butter and cream.',220,'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80','Main Course','veg',4.7,670,0,1,'["Black Lentils","Butter","Cream","Tomato"]','["Veg","Comfort Food"]'],
    // Sweet Treats (rest-7)
    ['food-701','rest-7','Gulab Jamun (6 Pieces)','Soft khoya dumplings in rose-scented sugar syrup.',149,'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80','Indian Sweets','veg',4.9,2340,1,1,'["Khoya","Flour","Sugar Syrup","Rose Water"]','["Bestseller","Sweet"]'],
    ['food-702','rest-7','Chocolate Lava Brownie','Warm brownie with molten centre, with vanilla ice cream.',199,'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80','Cakes','veg',4.8,1560,1,1,'["Dark Chocolate","Butter","Eggs","Flour"]','["Indulgent"]'],
    // Green Bowl (rest-8)
    ['food-801','rest-8','Acai Smoothie Bowl','Thick acai blend with granola, berries, chia seeds.',299,'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600&q=80','Smoothie Bowls','vegan',4.6,430,1,1,'["Acai","Banana","Berries","Granola","Chia Seeds"]','["Vegan","Healthy"]'],
    ['food-802','rest-8','Greek Salad Bowl','Cherry tomatoes, cucumber, olives, feta in lemon dressing.',249,'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80','Salad Bowls','veg',4.5,340,0,1,'["Tomatoes","Cucumber","Olives","Feta"]','["Light","Fresh"]'],
  ];
  for (const f of foods) {
    await db.execute(
      `INSERT IGNORE INTO foods (id,restaurant_id,name,description,price,image,category,veg_type,rating,rating_count,is_bestseller,is_available,ingredients,tags)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      f
    );
  }

  // ── Food customizations ──────────────────────────────────────
  const customizations: [string, string, string, number][] = [
    [uuid(),'food-101','Extra Raita',40],[uuid(),'food-101','Extra Gravy',50],[uuid(),'food-101','Extra Spicy',0],[uuid(),'food-101','Extra Cheese',60],
    [uuid(),'food-102','Extra Raita',40],[uuid(),'food-102','Extra Spicy',0],
    [uuid(),'food-103','Extra Paneer',60],[uuid(),'food-103','Extra Raita',40],
    [uuid(),'food-201','Extra Cheese',60],[uuid(),'food-201','Stuffed Crust',80],[uuid(),'food-201','No Onion',0],
    [uuid(),'food-202','Extra Cheese',60],[uuid(),'food-202','Extra Pepperoni',80],[uuid(),'food-202','No Jalapeños',0],
    [uuid(),'food-203','Extra Garlic',0],[uuid(),'food-203','Extra Cheese',40],
    [uuid(),'food-301','Extra Chutney',20],[uuid(),'food-301','Cheese Dosa',40],[uuid(),'food-301','Extra Spicy',0],
    [uuid(),'food-401','Extra Cheese',40],[uuid(),'food-401','Extra Patty',80],[uuid(),'food-401','No Onion',0],[uuid(),'food-401','Extra Sauce',20],
    [uuid(),'food-402','Extra Spicy',0],[uuid(),'food-402','No Pickles',0],[uuid(),'food-402','Extra Sauce',20],
    [uuid(),'food-501','Extra Spicy',0],[uuid(),'food-501','No Egg',0],[uuid(),'food-501','Extra Sauce',20],
    [uuid(),'food-601','Extra Gravy',30],[uuid(),'food-601','Extra Spicy',0],[uuid(),'food-601','No Onion',0],[uuid(),'food-601','No Garlic',0],
    [uuid(),'food-602','Extra Cheese',40],[uuid(),'food-602','Extra Spicy',0],
    [uuid(),'food-701','With Ice Cream',60],
    [uuid(),'food-702','Extra Ice Cream',60],[uuid(),'food-702','With Caramel Sauce',30],
  ];
  for (const [id, fid, name, price] of customizations) {
    await db.execute('INSERT IGNORE INTO food_customizations (id,food_id,name,price) VALUES (?,?,?,?)', [id, fid, name, price]);
  }

  // ── Coupons ──────────────────────────────────────────────────
  const coupons = [
    [uuid(),'FOOD20','percentage',20,200,150,'20% OFF on orders above ₹200 (max ₹150)'],
    [uuid(),'WELCOME50','flat',50,150,null,'₹50 OFF on your order (min ₹150)'],
    [uuid(),'FREEDELIVERY','free_delivery',0,100,null,'Free delivery on this order'],
    [uuid(),'BIRYANI100','flat',100,400,null,'₹100 OFF on orders above ₹400'],
    [uuid(),'NEWUSER','percentage',30,200,200,'30% OFF for new users (max ₹200)'],
  ];
  for (const c of coupons) {
    await db.execute('INSERT IGNORE INTO coupons (id,code,type,value,min_order,max_discount,description) VALUES (?,?,?,?,?,?,?)', c);
  }

  db.release();
  console.log('✅ Database seeded successfully!');
  console.log('\nDemo credentials:');
  console.log('  Customer : arjun@example.com      / customer123');
  console.log('  Restaurant: biryanihouse@foodora.com / rest123');
  console.log('  Admin    : admin@foodora.com       / admin123');
  process.exit(0);
}

seed().catch((e) => { console.error('Seed error:', e); process.exit(1); });
