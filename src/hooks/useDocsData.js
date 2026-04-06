import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";


export function useDocsData(tripId, refreshTripData) {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchDocuments = async () => {
        if (!tripId) {
        setIsLoading(false);
        return;
        }

        try {
        setIsLoading(true);
        // FIX: Removed the uploader_id filter so everyone in the group can see the files!
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

        if (error) {
            console.error("Error fetching documents:", error);
            return; 
        }

        if (docs) {
            const formattedDocs = docs.map((doc) => ({
            id: doc.doc_id,
            title: doc.file_name,
            url: doc.file_url,
            size: doc.file_size_bytes ? doc.file_size_bytes : 'Unknown Size',
            file_type: doc.file_type,
            date: new Date(doc.upload_timestamp).toLocaleDateString(),
            uploader: doc.Users ? `${doc.Users.first_name} ${doc.Users.last_name}` : 'Unknown'
            }));
            
            setDocuments(formattedDocs);
        }
        } catch (err) {
        console.error("Unexpected network/execution error:", err);
        } finally {
        setIsLoading(false); 
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [tripId]);

    const handleRefresh = async () => {
        if (refreshTripData) await refreshTripData();
        await fetchDocuments();
    };

    const pickDocument = async () => {
        try {
        let result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true, 
        });

        if (result.canceled) {
            setModalVisible(false);
            return;
        }

        setModalVisible(false);
        setIsLoading(true);

        const file = result.assets[0];
        const TEMP_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; 

        const fileExt = file.name.split('.').pop();
        const fileName = file.name.replace(`.${fileExt}`, '');
        const filePath = `${tripId}/${fileName}-${Date.now()}.${fileExt}`;

        const localFile = new File(file.uri);
        const arrayBuffer = await localFile.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('trip-documents')
            .upload(filePath, arrayBuffer, { 
            contentType: file.mimeType || 'application/octet-stream' 
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('trip-documents')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('documents')
            .insert({
            trip_id: tripId,
            uploader_id: TEMP_USER_ID,
            file_name: file.name,
            file_url: publicUrlData.publicUrl,
            file_size_bytes: file.size,
            file_type: fileExt.toLowerCase(),
            });

        if (dbError) throw dbError;

        await fetchDocuments();

        } catch (error) {
        console.error("Error uploading document:", error);
        alert("There was an issue uploading your document.");
        } finally {
        setIsLoading(false);
        }
    };

    const handleImageUpload = async (mediaFunction) => {
        try {
        const uri = await mediaFunction();
        if (!uri) return; 

        setModalVisible(false);
        setIsLoading(true);

        const TEMP_USER_ID = '5b6c11f8-d8d5-45c3-815b-54870bcbb0ad'; 
        const fileExt = uri.split('.').pop() || 'jpg';
        const fileName = `Photo_${Date.now()}`;
        const filePath = `${tripId}/${fileName}.${fileExt}`;

        const localFile = new File(uri);
        const arrayBuffer = await localFile.arrayBuffer();

        const { error: uploadError } = await supabase.storage
            .from('trip-documents')
            .upload(filePath, arrayBuffer, { 
            contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}` 
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
            .from('trip-documents')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('documents')
            .insert({
            trip_id: tripId,
            uploader_id: TEMP_USER_ID,
            file_name: `${fileName}.${fileExt}`,
            file_url: publicUrlData.publicUrl,
            file_size_bytes: 0, 
            file_type: fileExt.toLowerCase(),
            });

        if (dbError) throw dbError;

        await fetchDocuments();

        } catch (error) {
        console.error("Error uploading image:", error);
        alert("There was an issue uploading your image.");
        } finally {
        setIsLoading(false);
        }
    };

    return {
        documents,
        isLoading,
        modalVisible,
        setModalVisible,
        handleRefresh,
        pickDocument,
        handleImageUpload
    }
}