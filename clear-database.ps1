# Clear MongoDB Atlas Database
Write-Host "`nClearing MongoDB Atlas database..." -ForegroundColor Yellow

$uri = "mongodb+srv://msrrahulmahato_db_user:MCMia8eTYkkiUB3L@cluster0.m4nvq8k.mongodb.net/"
$dbName = "edutrack"

# Create Node.js script to clear database
$clearScript = @'
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://msrrahulmahato_db_user:MCMia8eTYkkiUB3L@cluster0.m4nvq8k.mongodb.net/';
const dbName = 'edutrack';

async function clearDatabase() {
    const client = new MongoClient(uri);
    
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const db = client.db(dbName);
        
        // Get all collections
        const collections = await db.listCollections().toArray();
        
        console.log(`Found ${collections.length} collections`);
        
        // Drop all collections
        for (const collection of collections) {
            await db.collection(collection.name).drop();
            console.log(`Dropped collection: ${collection.name}`);
        }
        
        console.log('Database cleared successfully!');
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

clearDatabase();
'@

# Write temp script
$clearScript | Out-File -FilePath "temp-clear-db.js" -Encoding utf8

# Execute script
node temp-clear-db.js

# Clean up
Start-Sleep -Seconds 2
Remove-Item "temp-clear-db.js" -ErrorAction SilentlyContinue

Write-Host "`nDatabase cleared! Ready for fresh tests." -ForegroundColor Green
