# Tasks
- Auth
- Map integration
- Pandal Card
- DB connection (Firebase/ Supabase)
- Global state management (Zustand)
- Add favourites tab
- Add all pandals tab (region wise)
- Find nearest pandal and give a shortest route using AI
- Search pandals
- Animated Splash Screen
- Add GUIDE access who can add pandals (1:56:32)

# Tables
1. Users table
    {id(number), name(string), email(string), gender(string)}

    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        gender TEXT NOT NULL
    );

    INSERT INTO users (id, name, email, gender) VALUES
    (gen_random_uuid(), 'Arijit Biswas', 'arijit@example.com', 'male'),
    (gen_random_uuid(), 'Sinthia Das', 'sinthia@example.com', 'female')

2. Pandals table 
    {id(number), clubName(string), theme(string), description(string), rating(number), images(string[]), artistName(string), latitude(number), longitude(number), address(string), clubSocialMediaLinks(string[])}

    CREATE TABLE pandals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clubName TEXT NOT NULL,
        theme TEXT,
        description TEXT,
        rating NUMERIC(2,1) CHECK (rating >= 0.0 AND rating <= 5.0),
        images TEXT[],
        artistName TEXT,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(10,8) NOT NULL,
        address TEXT,
        clubSocialMediaLinks TEXT[]
    );

    INSERT INTO pandals (id, clubName, theme, description, rating, images, artistName, latitude, longitude, address, clubSocialMediaLinks) VALUES
    (
        gen_random_uuid(), 'Behala Club', 'Mythology',
        'Depicting scenes from Ramayana with intricate lighting and large sculptures.', 4.5,
        ARRAY[
        'https://picsum.photos/800/600?random=1',
        'https://picsum.photos/800/600?random=2'
        ],
        'Subhankar Saha', 22.49823764, 88.31029083, 'Behala, Kolkata',
        ARRAY['https://facebook.com/behalaclub', 'https://instagram.com/behalaclub']
    ),
    (
        gen_random_uuid(), 'Lake Town Yuvak Sangha', 'Space Odyssey',
        'A futuristic theme exploring galaxies, planets, and neon-lit installations.', 4.9,
        ARRAY[
        'https://picsum.photos/800/600?random=3'
        ],
        'Ranjit Das', 22.60234018, 88.40982365, 'Lake Town, Kolkata',
        ARRAY['https://facebook.com/laketown', 'https://instagram.com/laketown']
    ),
    (
        gen_random_uuid(), 'College Square', 'Underwater World',
        'Marine-themed pandal with immersive underwater visuals and sound.', 4.2,
        ARRAY[
        'https://picsum.photos/800/600?random=4',
        'https://picsum.photos/800/600?random=5'
        ],
        'Anup Roy', 22.57264600, 88.36389500, 'College Street, Kolkata',
        ARRAY['https://facebook.com/collegesquare']
    ),
    (
        gen_random_uuid(), 'Santosh Mitra Square', 'Ancient Civilization',
        'Recreation of ancient Egyptian pyramids with golden lighting and pharaoh sculptures.', 4.7,
        ARRAY[
        'https://picsum.photos/800/600?random=6',
        'https://picsum.photos/800/600?random=7',
        'https://picsum.photos/800/600?random=8'
        ],
        'Pradip Mukherjee', 22.53987142, 88.36234578, 'Sealdah, Kolkata',
        ARRAY['https://facebook.com/santoshmitra', 'https://instagram.com/santoshmitra', 'https://twitter.com/santoshmitra']
    ),
    (
        gen_random_uuid(), 'Mohammad Ali Park', 'Environmental Conservation',
        'A green theme promoting climate awareness with life-sized tree installations and eco-friendly decorations.', 4.1,
        ARRAY[
        'https://picsum.photos/800/600?random=9',
        'https://picsum.photos/800/600?random=10'
        ],
        'Ashoke Dutta', 22.57845123, 88.35678234, 'Central Kolkata',
        ARRAY['https://facebook.com/mohammadalipark']
    ),
    (
        gen_random_uuid(), 'Triangular Park', 'Bollywood Retro',
        'Nostalgic Bollywood theme featuring iconic movie scenes and vintage poster recreations.', 3.8,
        ARRAY[
        'https://picsum.photos/800/600?random=11',
        'https://picsum.photos/800/600?random=12'
        ],
        'Sourav Banerjee', 22.54562378, 88.34123789, 'Entally, Kolkata',
        ARRAY['https://facebook.com/triangularpark', 'https://instagram.com/triangularpark']
    ),
    (
        gen_random_uuid(), 'Bagbazar Sarbojanin', 'Traditional Bengal',
        'Celebrating Bengali heritage with traditional motifs, terracotta work, and folk art displays.', 4.6,
        ARRAY[
        'https://picsum.photos/800/600?random=13',
        'https://picsum.photos/800/600?random=14',
        'https://picsum.photos/800/600?random=15'
        ],
        'Tarun Ghosh', 22.59234567, 88.37123456, 'Bagbazar, Kolkata',
        ARRAY['https://facebook.com/bagbazarsarbojanin', 'https://instagram.com/bagbazarsarbojanin']
    ),
    (
        gen_random_uuid(), 'Kumartuli Park', 'Art & Sculpture',
        'Showcasing the craftsmanship of Kumartuli artisans with live sculpture demonstrations and art installations.', 4.4,
        ARRAY[
        'https://picsum.photos/800/600?random=16',
        'https://picsum.photos/800/600?random=17'
        ],
        'Babu Pal', 22.59876543, 88.37654321, 'Kumartuli, Kolkata',
        ARRAY['https://facebook.com/kumartulipark', 'https://instagram.com/kumartulipark', 'https://youtube.com/kumartulipark']
    ),
    (
        gen_random_uuid(), 'Ballygunge Cultural Association', 'Royal Palace',
        'Majestic palace theme with ornate architecture, royal gardens, and regal decorations.', 4.8,
        ARRAY[
        'https://picsum.photos/800/600?random=18',
        'https://picsum.photos/800/600?random=19',
        'https://picsum.photos/800/600?random=20'
        ],
        'Dipankar Roy', 22.52456789, 88.36789012, 'Ballygunge, Kolkata',
        ARRAY['https://facebook.com/ballygungeca', 'https://instagram.com/ballygungeca']
    ),
    (
        gen_random_uuid(), 'Rashbehari Avenue', 'Science & Technology',
        'Modern tech theme featuring robotics, AI displays, and interactive digital installations.', 4.3,
        ARRAY[
        'https://picsum.photos/800/600?random=21',
        'https://picsum.photos/800/600?random=22',
        'https://picsum.photos/800/600?random=23'
        ],
        'Dr. Amit Chakraborty', 22.51234567, 88.35432109, 'Rashbehari Avenue, Kolkata',
        ARRAY['https://facebook.com/rashbehariavenue', 'https://instagram.com/rashbehariavenue', 'https://twitter.com/rashbehariave']
    );

3. User's favourite table
    {id(number), user_id(number), pandal_id(number)}

    CREATE TABLE user_favourites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pandal_id UUID NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
        UNIQUE (user_id, pandal_id)
    );

    INSERT INTO user_favourites (id, user_id, pandal_id)
    SELECT gen_random_uuid(), u.id, p.id
    FROM users u, pandals p
    WHERE u.email = 'arijit@example.com' AND p.clubName = 'Lake Town Yuvak Sangha';

    INSERT INTO user_favourites (id, user_id, pandal_id)
    SELECT gen_random_uuid(), u.id, p.id
    FROM users u, pandals p
    WHERE u.email = 'sinthia@example.com' AND p.clubName = 'College Square';

4. User's visited table
    {id(number), user_id(number), pandal_id(number)}

    CREATE TABLE user_visited (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pandal_id UUID NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
        UNIQUE (user_id, pandal_id)
    );

    INSERT INTO user_visited (id, user_id, pandal_id)
    SELECT gen_random_uuid(), u.id, p.id
    FROM users u, pandals p
    WHERE u.email = 'arijit@example.com' AND p.clubName = 'Behala Club';

    INSERT INTO user_visited (id, user_id, pandal_id)
    SELECT gen_random_uuid(), u.id, p.id
    FROM users u, pandals p
    WHERE u.email = 'arijit@example.com' AND p.clubName = 'Lake Town Yuvak Sangha';

    INSERT INTO user_visited (id, user_id, pandal_id)
    SELECT gen_random_uuid(), u.id, p.id
    FROM users u, pandals p
    WHERE u.email = 'sinthia@example.com' AND p.clubName = 'Behala Club';
