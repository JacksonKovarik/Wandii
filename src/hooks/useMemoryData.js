import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


const formatJournalDate = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export function useMemoryData(tripId, userId) {
    const [memories, setMemories] = useState([]);
    const [albumPhotos, setAlbumPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [entryTitle, setEntryTitle] = useState("");
    const [entryDescription, setEntryDescription] = useState("");
    const [entryImages, setEntryImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [totalPhotoCount, setTotalPhotoCount] = useState(0);
    

    // --- FETCH DATA LOGIC (Directly via Supabase Client) ---
    const fetchMemoriesData = async () => {
        if (!tripId) return;

        try {
        setIsLoading(true);

        // 1. Fetch Journals directly (Replaces get-trip-memories)
        const journalsPromise = supabase
            .from('Journals')
            .select(`
                entry_id,
                title,
                description,
                entry_timestamp,
                Photos ( photo_url )
            `)
            .eq('trip_id', tripId)
            .order('entry_timestamp', { ascending: false });

        // 2. Fetch Album preview directly (Replaces get-trip-album limit 5)
        const albumPromise = supabase
            .from('Photos')
            .select('photo_id, photo_url, uploaded_at')
            .eq('trip_id', tripId)
            .or('type.neq.idea_board,type.is.null')
            .order('uploaded_at', { ascending: false })
            .limit(5);

        // 3. Count total photos
        const countPromise = supabase
            .from('Photos')
            .select('*', { count: 'exact', head: true })
            .eq('trip_id', tripId);

        // Run all queries simultaneously for maximum speed
        const [journalsResponse, albumResponse, countResponse] = await Promise.all([
            journalsPromise,
            albumPromise,
            countPromise
        ]);

        // --- FORMAT JOURNALS ---
        if (journalsResponse.error) {
            console.error("Memories Fetch Error:", journalsResponse.error);
        } else if (journalsResponse.data) {
            const formattedMemories = journalsResponse.data.map((journal) => {
            const imageUrls = journal.Photos?.map((p) => p.photo_url).filter(Boolean) || [];
            
            // LOGICAL FIX 3: Replaced toLocaleDateString with safe formatter
            const formattedDate = formatJournalDate(journal.entry_timestamp);

            return {
                id: journal.entry_id,
                title: journal.title,
                description: journal.description,
                date: formattedDate,
                images: imageUrls
            };
            });
            setMemories(formattedMemories);
        }

        // --- FORMAT ALBUM PREVIEW ---
        if (albumResponse.error) {
            console.error("Album Fetch Error:", albumResponse.error);
        } else if (albumResponse.data) {
            const formattedAlbum = albumResponse.data.map((photo) => ({
            id: photo.photo_id,
            uri: photo.photo_url,
            mock: false 
            }));
            setAlbumPhotos(formattedAlbum);
        }

        // --- SET COUNT ---
        if (countResponse && countResponse.count !== null) {
            setTotalPhotoCount(countResponse.count);
        }

        } catch (err) {
        console.error("Unexpected error fetching memories/album:", err);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMemoriesData();
    }, [tripId]);

    const handleRefresh = async () => {
        await fetchMemoriesData();
    };

    // --- 📷 STANDALONE SHARED ALBUM UPLOAD ---
    const handleUploadSharedPhoto = async () => {
        try {
        const uri = await MediaUtils.pickImage();
        if (!uri) return;

        setIsLoading(true); 
        
        // Let MediaUtils handle compression, uploading, and database insertion!
        const newPhotoRecord = await MediaUtils.uploadImageToSupabase(uri, tripId, userId);

        // Update UI instantly
        setAlbumPhotos(prevPhotos => [
            { id: newPhotoRecord.photo_id || newPhotoRecord.id, uri: newPhotoRecord.photo_url, mock: false }, 
            ...prevPhotos
        ]);
        setTotalPhotoCount(prev => prev + 1);

        } catch (err) {
        console.error("Shared Photo Upload Error:", err);
        alert("Failed to upload photo. Please try again.");
        } finally {
        setIsLoading(false);
        }
    };

    // --- 📝 SAVE JOURNAL ENTRY (High-Speed Parallel) ---
    const handleAddEntryImage = async () => {
        const uri = await MediaUtils.pickImage();
        if (uri) setEntryImages(prev => [...prev, uri]);
    };

    const handleSaveEntry = async () => {
        if (!entryTitle.trim() || isUploading) return; 
        setIsUploading(true);

        try {
        // 1. Create the Journal Entry
        const { data: newJournal, error: journalError } = await supabase
            .from('Journals') 
            .insert({ 
            trip_id: tripId, 
            title: entryTitle, 
            description: entryDescription, 
            created_by: userId 
            })
            .select()
            .single();

        if (journalError) throw journalError;

        // 2. Upload any attached photos using MediaUtils
        if (entryImages.length > 0) {
            const uploadPromises = entryImages.map(async (uri) => {
            // Notice we pass newJournal.entry_id as the 4th parameter!
            return MediaUtils.uploadImageToSupabase(uri, tripId, userId, newJournal.entry_id);
            });

            await Promise.all(uploadPromises); 
        }

        // 3. Reset UI state
        setEntryTitle("");
        setEntryDescription("");
        setEntryImages([]);
        setIsModalVisible(false);
        
        // 4. Refresh to show new entry
        fetchMemoriesData(); 

        } catch (error) {
        console.error("Save Entry Error:", error);
        alert("Failed to save journal entry. Please try again.");
        } finally {
        setIsUploading(false);
        }
    };

    return {
        memories,
        albumPhotos,
        isLoading,
        isModalVisible,
        setIsModalVisible,
        entryTitle,
        setEntryTitle,
        entryDescription,
        setEntryDescription,
        entryImages,
        setEntryImages,
        isUploading,
        totalPhotoCount,
        handleRefresh,
        handleUploadSharedPhoto,
        handleAddEntryImage,
        handleSaveEntry
    }
} 