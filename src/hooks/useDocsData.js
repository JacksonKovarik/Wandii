import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from "react";
import { Alert } from "react-native";
import { supabase } from "../lib/supabase";
// Adjust this import path to wherever your MediaUtils file lives!
import { MediaUtils } from "@/src/utils/MediaUtils";


export const fetchDocumentsAPI = async (tripId) => {
    const { data: docs, error } = await supabase
        .from('documents')
        .select(`
            doc_id,
            file_name,
            file_url,
            file_size_bytes,
            file_type,
            upload_timestamp,
            Users ( first_name, last_name )
        `)
        .eq('trip_id', tripId)
        .order('upload_timestamp', { ascending: false });

    if (error) throw error;

    return docs.map((doc) => ({
        id: doc.doc_id,
        title: doc.file_name,
        url: doc.file_url,
        size: doc.file_size_bytes ? doc.file_size_bytes : 'Unknown Size',
        file_type: doc.file_type,
        date: new Date(doc.upload_timestamp).toLocaleDateString(),
        uploader: doc.Users ? `${doc.Users.first_name} ${doc.Users.last_name}` : 'Unknown'
    }));
};


export function useDocsData(tripId, userId) {
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);

    // 1. Fetching Documents with TanStack
    const {
        data: documents = [],
        isLoading,
        isFetching,
        refetch: handleRefresh
    } = useQuery({
        queryKey: ['documents', tripId],
        queryFn: async () => fetchDocumentsAPI(tripId),
        enabled: !!tripId, 
        staleTime: 1000 * 60 * 5, 
    });

    // 2. The Upload Helper (Stays specific to the 'documents' table)
    const uploadFileToSupabase = async ({ uri, originalName, mimeType, size }) => {
        if (!userId) throw new Error("User ID is missing!");

        const fileExt = originalName.split('.').pop() || 'jpg';
        const fileName = originalName.replace(`.${fileExt}`, '');
        const filePath = `${tripId}/${fileName}-${Date.now()}.${fileExt}`;

        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('trip-documents')
            .upload(filePath, arrayBuffer, { 
                contentType: mimeType || 'application/octet-stream' 
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('trip-documents')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('documents')
            .insert({
                trip_id: tripId,
                uploader_id: userId,
                file_name: originalName,
                file_url: publicUrlData.publicUrl,
                file_size_bytes: size || 0,
                file_type: fileExt.toLowerCase(),
            });

        if (dbError) throw dbError;
        return true;
    };

    // 3. TanStack Mutation for Uploading Files
    const uploadMutation = useMutation({
        mutationFn: uploadFileToSupabase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', tripId] });
            setModalVisible(false);
        },
        onError: (error) => {
            console.error("Error uploading file:", error);
            Alert.alert("Upload Error", "There was an issue uploading your file.");
            setModalVisible(false);
        }
    });

    // 4. File Picker Triggers
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true, 
            });

            if (!result.canceled) {
                const file = result.assets[0];
                uploadMutation.mutate({
                    uri: file.uri, 
                    originalName: file.name, 
                    mimeType: file.mimeType, 
                    size: file.size
                });
            }
        } catch (error) {
            console.error("Document picker error:", error);
        }
    };

    // 🌟 REFACTORED TO USE YOUR MEDIA UTILS
    const pickImage = async () => {
        try {
            const uri = await MediaUtils.pickImage();
            
            // If uri is null, the user canceled or denied permission
            if (uri) {
                // MediaUtils returns compressed JPEGs, so we can safely assume the extension
                const fileName = `Photo_${Date.now()}.jpg`;
                uploadMutation.mutate({
                    uri: uri, 
                    originalName: fileName, 
                    mimeType: 'image/jpeg', 
                    size: 0 // Size is recalculated safely in Supabase Storage
                });
            }
        } catch (error) {
            console.error("Image picker error:", error);
        }
    };

    // 🌟 REFACTORED TO USE YOUR MEDIA UTILS
    const takePhoto = async () => {
        try {
            const uri = await MediaUtils.takePhoto();
            
            // If uri is null, the user canceled or denied permission
            if (uri) {
                const fileName = `Camera_${Date.now()}.jpg`;
                uploadMutation.mutate({
                    uri: uri, 
                    originalName: fileName, 
                    mimeType: 'image/jpeg', 
                    size: 0
                });
            }
        } catch (error) {
            console.error("Camera error:", error);
        }
    };

    return {
        documents,
        isLoading: isLoading || uploadMutation.isPending,
        isRefreshing: isFetching && !isLoading,
        modalVisible,
        setModalVisible,
        handleRefresh,
        pickDocument,
        pickImage,
        takePhoto
    };
}