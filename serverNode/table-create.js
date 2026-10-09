require('dotenv').config();
const mysql = require('mysql2/promise');

async function createSchema() {
    console.log(`Attempting to connect to ${process.env.DB_HOST}:${process.env.DB_PORT} as ${process.env.DB_USER}...`)

try {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 6603,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD, 
        database: process.env.DB_NAME || 'dolos_app',
    });

    console.log("Connected to MySQL. Creating tables...");

    // 1. MOVIES TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        imdb_id VARCHAR(20) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        release_year SMALLINT,
        age_rating VARCHAR(10),
        external_rating DECIMAL(3, 1),
        tagline TEXT,
        synopsis TEXT,
        poster_url VARCHAR(500)
      );
    `);
    console.log("✓ 'movies' table created.");

    // 2. PERSONS TABLE
    await connection.query(`
      CREATE TABLE IF NOT EXISTS persons (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        full_name VARCHAR(255) NOT NULL,
        photo_url VARCHAR(500),
        biography TEXT
      );
    `);
    console.log("✓ 'persons' table created.");

    // 3. MOVIE_RATINGS TABLE (Users rate movies)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movie_ratings (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        movie_id VARCHAR(36) NOT NULL,
        rating SMALLINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_movie_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_movie_ratings_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        CONSTRAINT uq_user_movie_rating UNIQUE (user_id, movie_id)
      );
    `);
    console.log("✓ 'movie_ratings' table created.");

    // 4. MOVIE_FANS TABLE (Users bookmark/favorite movies)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movie_fans (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        movie_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_movie_fans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_movie_fans_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        CONSTRAINT uq_user_movie_fan UNIQUE (user_id, movie_id)
      );
    `);
    console.log("✓ 'movie_fans' table created.");

    // 5. PERSON_FANS TABLE (Users follow actors/directors)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS person_fans (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        person_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_person_fans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_person_fans_person FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
        CONSTRAINT uq_user_person_fan UNIQUE (user_id, person_id)
      );
    `);
    console.log("✓ 'person_fans' table created.");

    // 6. MOVIE_CREDITS TABLE (Actors/crew participating in movies)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS movie_credits (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        movie_id VARCHAR(36) NOT NULL,
        person_id VARCHAR(36) NOT NULL,
        role_type VARCHAR(30) NOT NULL,
        character_name VARCHAR(255),
        CONSTRAINT fk_credits_movie FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        CONSTRAINT fk_credits_person FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
      );
    `);
    console.log("✓ 'movie_credits' table created.");

    await connection.end();
    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Database error:", error.message);
  }
}

createSchema();