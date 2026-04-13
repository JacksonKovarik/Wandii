import { supabase } from "@/src/lib/supabase";
import DateUtils from "@/src/utils/DateUtils";
import { getCoordinatesForAddress } from "@/src/utils/LocationUtils";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import { Alert } from "react-native";

// 1. EXPORT API FUNCTION (For Dashboard Prefetching)
export const fetchStaysAPI = async (tripId) => {
    if (!tripId) return [];
    const { data, error } = await supabase
        .from('Accommodations')
        .select('*')
        .eq('trip_id', tripId)
        .order('check_in', { ascending: true }); // Chronological order!

    if (error) throw error;
    return data || [];
};

export function useStaysData(tripId, destination) {
    const queryClient = useQueryClient();

    // --- FORM & UI STATE (Exact match to your original code) ---
    const defaultStayState = { id: null, title: '', address: '', checkIn: null, checkOut: null };
    const [isModalVisible, setModalVisible] = useState(false);
    const [stayForm, setStayForm] = useState(defaultStayState);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [datePickerTarget, setDatePickerTarget] = useState(null);

    // --- TANSTACK QUERY ---
    const { data: staysData = [], isLoading, refetch: fetchStays } = useQuery({
        queryKey: ['stays', tripId],
        queryFn: () => fetchStaysAPI(tripId),
        enabled: !!tripId,
        staleTime: 1000 * 60 * 5, // 5 minute cache
    });

    // --- TANSTACK MUTATIONS ---
    const saveStayMutation = useMutation({
        mutationFn: async () => {
            let coords;
            if (stayForm.address) {
                coords = await getCoordinatesForAddress(stayForm.address, destination);      
            }

            const dbPayload = {
                trip_id: tripId,
                title: stayForm.title,
                address: stayForm.address,
                check_in: stayForm.checkIn ? DateUtils.toLocalISOString(stayForm.checkIn) : null,
                check_out: stayForm.checkOut ? DateUtils.toLocalISOString(stayForm.checkOut) : null,
                latitude: coords?.latitude || null,  
                longitude: coords?.longitude || null,      
            };

            if (stayForm.id) {
                // UPDATE
                const { error } = await supabase.from('Accommodations').update(dbPayload).eq('accommodation_id', stayForm.id);
                if (error) throw error;
            } else {
                // INSERT
                const { error } = await supabase.from('Accommodations').insert(dbPayload);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stays', tripId] });
            setModalVisible(false);
            setStayForm(defaultStayState);
        },
        onError: (err) => {
            console.error("Save Error:", err);
            Alert.alert("Error", "Could not save accommodation details.");
        }
    });

    const deleteStayMutation = useMutation({
        mutationFn: async (stayId) => {
            const { error } = await supabase.from('Accommodations').delete().eq('accommodation_id', stayId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stays', tripId] });
        },
        onError: (err) => {
            console.error("Delete Error:", err);
            Alert.alert("Error", "Could not delete stay.");
        }
    });

    // --- ACTION HANDLERS ---
    const handleDeletePress = (stayId) => {
        Alert.alert(
            "Delete Stay",
            "Are you sure you want to remove this accommodation?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteStayMutation.mutate(stayId) }
            ]
        );
    };

    const handleOpenAdd = () => {
        setStayForm(defaultStayState);
        setModalVisible(true);
    };

    const handleOpenEdit = (stay) => {
        setStayForm({
            id: stay.accommodation_id,
            title: stay.title,
            address: stay.address,
            checkIn: stay.check_in ? new Date(stay.check_in) : null,
            checkOut: stay.check_out ? new Date(stay.check_out) : null,
        });
        setModalVisible(true);
    };

    const handleSaveStay = () => saveStayMutation.mutate();

    const showDatePicker = (target) => {
        setDatePickerTarget(target);
        setDatePickerVisible(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisible(false);
        setDatePickerTarget(null);
    };

    const handleConfirmDate = (date) => {
        setStayForm(prev => ({ ...prev, [datePickerTarget]: date }));
        hideDatePicker();
    };

    return {
        staysData,
        isLoading,
        isSaving: saveStayMutation.isPending,
        isModalVisible, setModalVisible,
        stayForm, setStayForm,
        isDatePickerVisible, datePickerTarget,
        fetchStays,
        handleDeletePress,
        handleOpenAdd,
        handleOpenEdit,
        handleSaveStay,
        showDatePicker,
        hideDatePicker,
        handleConfirmDate
    };
}