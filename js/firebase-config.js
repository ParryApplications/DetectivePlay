// Firebase Configuration
// Replace these values with your actual Firebase project credentials

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js';
import { getDatabase, ref, get, set, push, update, remove, query, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDoAuykwPPZuSDqocw5-CE3lVbt2zqoCJY",
    authDomain: "murdermystery-91fb8.firebaseapp.com",
    databaseURL: "https://murdermystery-91fb8-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "murdermystery-91fb8",
    storageBucket: "murdermystery-91fb8.firebasestorage.app",
    messagingSenderId: "141136308619",
    appId: "1:141136308619:web:9b4a4fb5a417cf79f0678e",
    measurementId: "G-79HLD7X7DZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

// Export Firebase services
export { app, analytics, db, ref, get, set, push, update, remove, query, orderByChild, equalTo };

// Database paths
export const DB_PATHS = {
    MYSTERIES: 'mysteries',
    SUBSCRIBERS: 'subscribers',
    ADMIN_CONFIG: 'admin_config'
};

// Helper function to get a random mystery
// Note: category parameter is for filtering by mystery category (e.g., 'historical', 'modern')
// Game modes ('as_detective', 'solved_mystery') should be ignored for filtering
export async function getRandomMystery(category = null) {
    try {
        const mysteriesRef = ref(db, DB_PATHS.MYSTERIES);
        const snapshot = await get(mysteriesRef);
        
        if (!snapshot.exists()) {
            console.error('No mysteries found in database');
            return null;
        }
        
        const mysteriesData = snapshot.val();
        const mysteries = [];
        
        // Game modes that should not be used for category filtering
        const gameModes = ['as_detective', 'solved_mystery'];
        
        // Convert object to array and filter
        Object.keys(mysteriesData).forEach((key) => {
            const mystery = { id: key, ...mysteriesData[key] };
            
            // Filter by category and active status
            // Only filter by category if it's provided and not a game mode
            if (mystery.is_active) {
                if (!category || gameModes.includes(category) || mystery.category === category) {
                    mysteries.push(mystery);
                }
            }
        });
        
        if (mysteries.length === 0) {
            console.error('No active mysteries found matching criteria');
            return null;
        }
        
        console.log(`Found ${mysteries.length} active mysteries`);
        
        // Return random mystery
        const randomIndex = Math.floor(Math.random() * mysteries.length);
        return mysteries[randomIndex];
    } catch (error) {
        console.error('Error fetching mystery:', error);
        throw error;
    }
}

// Helper function to check if email already exists
export async function checkEmailExists(email) {
    try {
        const subscribersRef = ref(db, DB_PATHS.SUBSCRIBERS);
        const snapshot = await get(subscribersRef);
        
        if (!snapshot.exists()) {
            return false;
        }
        
        const subscribersData = snapshot.val();
        
        // Check if any subscriber has the same email
        for (const key in subscribersData) {
            if (subscribersData[key].email === email) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking email:', error);
        throw error;
    }
}

// Helper function to add a subscriber
export async function addSubscriber(subscriberData) {
    try {
        const subscribersRef = ref(db, DB_PATHS.SUBSCRIBERS);
        const newSubscriberRef = push(subscribersRef);
        
        await set(newSubscriberRef, {
            ...subscriberData,
            subscribed_at: new Date().toISOString()
        });
        
        return newSubscriberRef.key;
    } catch (error) {
        console.error('Error adding subscriber:', error);
        throw error;
    }
}

// Helper function to get all mysteries (admin)
export async function getAllMysteries() {
    try {
        const mysteriesRef = ref(db, DB_PATHS.MYSTERIES);
        const snapshot = await get(mysteriesRef);
        
        if (!snapshot.exists()) {
            return [];
        }
        
        const mysteriesData = snapshot.val();
        const mysteries = [];
        
        Object.keys(mysteriesData).forEach((key) => {
            mysteries.push({ id: key, ...mysteriesData[key] });
        });
        
        return mysteries;
    } catch (error) {
        console.error('Error fetching mysteries:', error);
        throw error;
    }
}

// Helper function to add a mystery (admin)
export async function addMystery(mysteryData) {
    try {
        const mysteriesRef = ref(db, DB_PATHS.MYSTERIES);
        const newMysteryRef = push(mysteriesRef);
        
        await set(newMysteryRef, {
            ...mysteryData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
        });
        
        return newMysteryRef.key;
    } catch (error) {
        console.error('Error adding mystery:', error);
        throw error;
    }
}

// Helper function to update a mystery (admin)
export async function updateMystery(mysteryId, mysteryData) {
    try {
        const mysteryRef = ref(db, `${DB_PATHS.MYSTERIES}/${mysteryId}`);
        await update(mysteryRef, {
            ...mysteryData,
            updated_at: new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error updating mystery:', error);
        throw error;
    }
}

// Helper function to delete a mystery (admin)
export async function deleteMystery(mysteryId) {
    try {
        const mysteryRef = ref(db, `${DB_PATHS.MYSTERIES}/${mysteryId}`);
        await remove(mysteryRef);
        return true;
    } catch (error) {
        console.error('Error deleting mystery:', error);
        throw error;
    }
}

// Helper function to get all subscribers (admin)
export async function getAllSubscribers() {
    try {
        const subscribersRef = ref(db, DB_PATHS.SUBSCRIBERS);
        const snapshot = await get(subscribersRef);
        
        if (!snapshot.exists()) {
            return [];
        }
        
        const subscribersData = snapshot.val();
        const subscribers = [];
        
        Object.keys(subscribersData).forEach((key) => {
            subscribers.push({ id: key, ...subscribersData[key] });
        });
        
        return subscribers;
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        throw error;
    }
}

console.log('Firebase initialized successfully');
