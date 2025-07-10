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
- Add guide access who can add pandals

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

    INSERT INTO pandals (id, clubName, theme, description, rating, images, artistName,latitude, longitude, address, clubSocialMediaLinks) VALUES
    (
        gen_random_uuid(), 'Behala Club', 'Mythology',
        'Depicting scenes from Ramayana with intricate lighting and large sculptures.', 4.5,
        ARRAY[
        'https://images.unsplash.com/photo-1549921296-3a5f36a6f1fa',
        'https://images.unsplash.com/photo-1592853625608-fd1db51a2ba0'
        ],
        'Subhankar Saha', 22.49823764, 88.31029083, 'Behala, Kolkata',
        ARRAY['https://facebook.com/behalaclub', 'https://instagram.com/behalaclub']
    ),
    (
        gen_random_uuid(), 'Lake Town Yuvak Sangha', 'Space Odyssey',
        'A futuristic theme exploring galaxies, planets, and neon-lit installations.', 4.9,
        ARRAY[
        'https://images.unsplash.com/photo-1600376094232-481c1f9b1cce'
        ],
        'Ranjit Das', 22.60234018, 88.40982365, 'Lake Town, Kolkata',
        ARRAY['https://facebook.com/laketown', 'https://instagram.com/laketown']
    ),
    (
        gen_random_uuid(), 'College Square', 'Underwater World',
        'Marine-themed pandal with immersive underwater visuals and sound.', 4.2,
        ARRAY[
        'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
        ],
        'Anup Roy', 22.57264600, 88.36389500, 'College Street, Kolkata',
        ARRAY['https://facebook.com/collegesquare']
    );

3. User's favourite table
    {id(number), user_id(number), pandal_id(number)}

    CREATE TABLE user_favourites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pandal_id INTEGER NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
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
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        pandal_id INTEGER NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
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
