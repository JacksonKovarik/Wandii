import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { supabase } from "../lib/supabase";
// Adjust this import path if your MediaUtils is somewhere else!
import { MediaUtils } from "../utils/MediaUtils";

const formatJournalDate = (dateVal) => {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

export const fetchMemoryDataAPI = async (tripId) => {
    const journalsPromise = supabase
        .from('Journals')
        .select(`
            entry_id,
            title,
            description,
            entry_timestamp,
            Photos ( photo_url ),
            author:Users!created_by ( first_name, last_name, avatar_url )
        `)
        .eq('trip_id', tripId)
        .order('entry_timestamp', { ascending: false });

    const albumPromise = supabase
        .from('Photos')
        .select('photo_id, photo_url, uploaded_at')
        .eq('trip_id', tripId)
        .or('type.neq.idea_board,type.is.null')
        .order('uploaded_at', { ascending: false })
        .limit(5);

    const countPromise = supabase
        .from('Photos')
        .select('*', { count: 'exact', head: true })
        .eq('trip_id', tripId);

    // Run all queries simultaneously
    const [journalsRes, albumRes, countRes] = await Promise.all([
        journalsPromise, albumPromise, countPromise
    ]);

    if (journalsRes.error) throw journalsRes.error;
    if (albumRes.error) throw albumRes.error;

    // Format exactly how your old code did
    const formattedMemories = (journalsRes.data || []).map((journal) => ({
        id: journal?.entry_id,
        title: journal?.title,
        description: journal?.description,
        date: formatJournalDate(journal?.entry_timestamp),
        images: journal.Photos?.map((p) => p.photo_url).filter(Boolean) || [],
        author_first_name: journal?.author?.first_name,
        author_last_name: journal?.author?.last_name,
        author_avatar: journal?.author?.avatar_url
    }));

    const formattedAlbum = (albumRes.data || []).map((photo) => ({
        id: photo.photo_id,
        uri: photo.photo_url,
        mock: false 
    }));

    return {
        memories: formattedMemories,
        albumPhotos: formattedAlbum,
        totalPhotoCount: countRes.count || 0
    };
};


export function useMemoryData(tripId, userId) {
    const queryClient = useQueryClient();

    // --- UI STATES (Kept exactly the same) ---
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [entryTitle, setEntryTitle] = useState("");
    const [entryDescription, setEntryDescription] = useState("");
    const [entryImages, setEntryImages] = useState([]);

    // --- 1. TANSTACK QUERY: Fetch Data ---
    const { 
        data, 
        isLoading: isFetchingMemories, 
        refetch 
    } = useQuery({
        queryKey: ['memories', tripId],
        queryFn: async () => fetchMemoryDataAPI(tripId),
        enabled: !!tripId,
        staleTime: 1000 * 60 * 5,
    });

    // Safely extract the fetched data (Fallback to empty arrays if loading)
    const memories = data?.memories || [];
    const albumPhotos = data?.albumPhotos || [];
    const totalPhotoCount = data?.totalPhotoCount || 0;

    // --- 2. TANSTACK MUTATION: Upload Shared Photo ---
    const uploadSharedPhotoMutation = useMutation({
        mutationFn: async (uri) => {
            return await MediaUtils.uploadImageToSupabase(uri, tripId, userId);
        },
        onSuccess: () => {
            // Refresh the screen data to show the new photo
            queryClient.invalidateQueries({ queryKey: ['memories', tripId] });
        },
        onError: (err) => {
            console.error("Shared Photo Upload Error:", err);
            alert("Failed to upload photo. Please try again.");
        }
    });

    // --- 3. TANSTACK MUTATION: Save Journal Entry ---
    const saveEntryMutation = useMutation({
        mutationFn: async () => {
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

            // Upload any attached photos using MediaUtils
            if (entryImages.length > 0) {
                const uploadPromises = entryImages.map(async (uri) => {
                    return MediaUtils.uploadImageToSupabase(uri, tripId, userId, newJournal.entry_id);
                });
                await Promise.all(uploadPromises); 
            }
            
            return true;
        },
        onSuccess: () => {
            // Reset UI state
            setEntryTitle("");
            setEntryDescription("");
            setEntryImages([]);
            setIsModalVisible(false);
            // Refresh data
            queryClient.invalidateQueries({ queryKey: ['memories', tripId] });
        },
        onError: (error) => {
            console.error("Save Entry Error:", error);
            alert("Failed to save journal entry. Please try again.");
        }
    });

    // --- 4. ACTION WRAPPERS (Identical to your old functions) ---
    
    const handleRefresh = async () => {
        await refetch();
    };

    const handleUploadSharedPhoto = async () => {
        try {
            const uri = await MediaUtils.pickImage();
            if (uri) {
                uploadSharedPhotoMutation.mutate(uri);
            }
        } catch (err) {
            console.error("Picker Error:", err);
        }
    };

    const handleAddEntryImage = async () => {
        try {
            const uri = await MediaUtils.pickImage();
            if (uri) setEntryImages(prev => [...prev, uri]);
        } catch (err) {
            console.error("Picker Error:", err);
        }
    };

    const handleSaveEntry = async () => {
        if (!entryTitle.trim() || saveEntryMutation.isPending) return; 
        saveEntryMutation.mutate();
    };

    // --- 5. EXACT RETURN OBJECT ---
    return {
        memories,
        albumPhotos,
        // Loading is true if fetching OR if the shared photo is currently uploading
        isLoading: isFetchingMemories || uploadSharedPhotoMutation.isPending, 
        isModalVisible,
        setIsModalVisible,
        entryTitle,
        setEntryTitle,
        entryDescription,
        setEntryDescription,
        entryImages,
        setEntryImages,
        isUploading: saveEntryMutation.isPending, // Exact match for your old state
        totalPhotoCount,
        handleRefresh,
        handleUploadSharedPhoto,
        handleAddEntryImage,
        handleSaveEntry
    }
}