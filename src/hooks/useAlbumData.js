import { supabase } from "@/src/lib/supabase";
import { MediaUtils } from "@/src/utils/MediaUtils"; // Adjust path if needed
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const LIMIT = 21;

export function useAlbumData(tripId) {
    const queryClient = useQueryClient();

    // 1. Fetch & Paginate Photos
    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['albumPhotos', tripId],
        queryFn: async ({ pageParam = 0 }) => {
            if (!tripId) return { data: [], nextOffset: null };

            const { data: albumPhotos, error } = await supabase
                .from('Photos')
                .select('photo_id, photo_url, uploaded_at')
                .eq('trip_id', tripId)
                .or('type.neq.idea_board,type.is.null')
                .order('uploaded_at', { ascending: false })
                .range(pageParam, pageParam + LIMIT - 1);

            if (error) throw error;

            return {
                // Format the data exactly as the UI expects it
                data: albumPhotos.map((photo) => ({
                    id: photo.photo_id,
                    uri: photo.photo_url,
                    mock: false
                })),
                // Determine if there is another page
                nextOffset: albumPhotos.length === LIMIT ? pageParam + LIMIT : null,
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        enabled: !!tripId,
    });

    // Flatten the pages into a single array of photos for the UI
    const photos = data?.pages.flatMap(page => page.data) || [];

    // 2. Upload Mutation
    const uploadPhotoMutation = useMutation({
        mutationFn: async (uri) => {
            const CURRENT_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; // Replace with real Auth ID when ready
            return await MediaUtils.uploadImageToSupabase(uri, tripId, CURRENT_USER_ID);
        },
        onSuccess: () => {
            // Automatically refresh the photo grid after a successful upload!
            queryClient.invalidateQueries({ queryKey: ['albumPhotos', tripId] });
        }
    });

    return {
        photos,
        isLoading: isLoading && !photos.length, // Only true on initial load
        isLoadingMore: isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
        uploadPhoto: uploadPhotoMutation.mutateAsync,
        isUploading: uploadPhotoMutation.isPending
    };
}