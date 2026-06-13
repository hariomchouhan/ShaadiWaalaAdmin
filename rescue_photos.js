import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';

// ⚠️ PASTE YOUR NEW SUPABASE URL AND ANON KEY HERE
const supabaseUrl = 'https://sgyntaiqhevyqsegyfxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNneW50YWlxaGV2eXFzZWd5ZnhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY5MDI5NywiZXhwIjoyMDg4MjY2Mjk3fQ.BFvhg0zpwl_rpxHRTCzIP2zQkC0a1pqDv-blFC1Xxt4';
const supabase = createClient(supabaseUrl, supabaseKey);

const inputFile = 'profiles_rows.csv'; // Your original heavy file

// Helper function to upload Base64 to Supabase Storage
async function uploadBase64(b64String, fileName) {
    if (!b64String || !b64String.includes('base64,')) return null;
    
    // Strip the "data:image/jpeg;base64," prefix
    const base64Data = b64String.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const { error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
        
    if (error) {
        console.error(`❌ Failed to upload ${fileName}:`, error.message);
        return null;
    }
    
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
    return data.publicUrl;
}

async function runMigration() {
    console.log("🚀 Starting Photo Rescue Mission...");
    const csvFile = fs.readFileSync(inputFile, 'utf8');
    
    Papa.parse(csvFile, {
        header: true,
        skipEmptyLines: true,
        complete: async function(results) {
            const rows = results.data;
            console.log(`Found ${rows.length} profiles. Scanning for images...`);
            
            for (let row of rows) {
                if (!row.id || !row.data) continue;

                try {
                    let dataObj = JSON.parse(row.data);
                    let needsUpdate = false;
                    const refId = dataObj.refId || row.id.substring(0,5);
                    
                    // 1. Rescue Main Avatar
                    if (dataObj.avatar && dataObj.avatar.includes('base64,')) {
                        console.log(`📸 Extracting Avatar for profile #${refId}...`);
                        const fileName = `avatar_${row.id}.jpg`;
                        const newUrl = await uploadBase64(dataObj.avatar, fileName);
                        
                        if (newUrl) {
                            dataObj.avatar = newUrl;
                            needsUpdate = true;
                        }
                    }

                    // 2. Rescue Gallery Photos
                    if (dataObj.gallery && Array.isArray(dataObj.gallery)) {
                        let newGalleryUrls = [];
                        for (let i = 0; i < dataObj.gallery.length; i++) {
                            let img = dataObj.gallery[i];
                            if (img && img.includes('base64,')) {
                                console.log(`🖼️ Extracting Gallery Photo ${i+1} for profile #${refId}...`);
                                const fileName = `gallery_${row.id}_${i}.jpg`;
                                const newUrl = await uploadBase64(img, fileName);
                                if (newUrl) newGalleryUrls.push(newUrl);
                            } else if (img) {
                                newGalleryUrls.push(img);
                            }
                        }
                        if (newGalleryUrls.length > 0) {
                            dataObj.gallery = newGalleryUrls;
                            needsUpdate = true;
                        }
                    }
                    
                    // 3. Update the database row with the clean URLs
                    if (needsUpdate) {
                        const { error } = await supabase
                            .from('profiles')
                            .update({ data: dataObj })
                            .eq('id', row.id);
                            
                        if (error) {
                            console.error(`❌ DB Update Error for #${refId}:`, error.message);
                        } else {
                            console.log(`✅ Profile #${refId} successfully updated with new image URLs.`);
                        }
                    }
                } catch (e) {
                    console.error(`⚠️ Could not parse row ${row.id}:`, e.message);
                }
            }
            console.log("\n🎉 MISSION ACCOMPLISHED! All recoverable photos have been uploaded and linked.");
        }
    });
}

runMigration();