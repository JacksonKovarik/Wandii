import { supabase } from "@/src/lib/supabase";
import DateUtils from "@/src/utils/DateUtils";
import { getCoordinatesForAddress } from "@/src/utils/LocationUtils";
import { useTrip } from "@/src/utils/TripContext";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { reorderItems } from 'react-native-reorderable-list';

// ==========================================
// HELPER: Time Sorting
// ==========================================
const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || !timeStr.includes(' ')) return 0;
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

export function useTimeline() {
    const tripData = useTrip();
    const queryClient = useQueryClient();

    const { 
        tripId,
        timelineData = {}, 
        addEventToBucket, 
        updateDayEvents, 
        unassignedIdeas = [], 
        updateEventTime, 
        unassignEvent, 
        deleteEvent,
        updateEventDetails,
        destination,
        startDate,
        endDate,
    } = tripData;

    // ==========================================
    // UI STATES
    // ==========================================
    const [selectedDate, setSelectedDate] = useState(null);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isIdeaBankVisible, setIdeaBankVisible] = useState(false);
    
    // Details/Edit states
    const [selectedEventDetails, setSelectedEventDetails] = useState(null);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [eventEditForm, setEventEditForm] = useState({
        title: '',
        description: '',
        address: ''
    });

    // ==========================================
    // DERIVED DATA
    // ==========================================
    const dateList = useMemo(() => {
        if (!startDate || !endDate) return [];
        return DateUtils.getDatesBetween(startDate, endDate);
    }, [startDate, endDate]);

    useEffect(() => {
        if (dateList.length > 0 && !selectedDate) {
            setSelectedDate(dateList[0].fullDate);
        }
    }, [dateList]);

    const activeDateStr = selectedDate ? DateUtils.formatDateToYYYYMMDD(selectedDate) : null;
    const currentDayData = useMemo(() => {
        if (!activeDateStr) return [];
        return timelineData[activeDateStr] || [];
    }, [timelineData, activeDateStr]);

    const flexibleBucket = useMemo(() => currentDayData.filter(item => item.time === 'TBD'), [currentDayData]);
    const anchoredTimeline = useMemo(() => currentDayData.filter(item => item.time !== 'TBD').sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)), [currentDayData]);

    // ==========================================
    // TANSTACK MUTATION: Edit Event
    // ==========================================
    const editEventMutation = useMutation({
        mutationFn: async ({ eventId, updatePayload }) => {
            const { error } = await supabase
                .from('Events')
                .update(updatePayload)
                .eq('event_id', eventId);

            if (error) throw error;
        },
        onSuccess: () => {
            // Silently sync the background cache to ensure total accuracy
            queryClient.invalidateQueries({ queryKey: ['tripDashboard', tripId] });
        },
        onError: (error) => {
            console.error("Save Event Error:", error);
            Alert.alert("Error", "Failed to save event details. Your changes have been reverted.");
            queryClient.invalidateQueries({ queryKey: ['tripDashboard', tripId] });
        }
    });

    // ==========================================
    // ACTION HANDLERS
    // ==========================================
    const handleViewDetails = (item) => {
        setSelectedEventDetails(item);
        setEventEditForm({
            title: item.title || '',
            description: item.description || '',
            address: item.address || ''
        });
        setIsEditingEvent(false);
    };

    const handleCloseDetails = () => {
        setSelectedEventDetails(null);
        setIsEditingEvent(false);
    };

    const handleSaveEventDetails = async () => {
        if (!selectedEventDetails) return;

        let latitude = selectedEventDetails.latitude;
        let longitude = selectedEventDetails.longitude;

        // If the user changed the address, fetch new coordinates
        if (eventEditForm.address && eventEditForm.address !== selectedEventDetails.address) {
            const coords = await getCoordinatesForAddress(eventEditForm.address);
            if (coords) {
                latitude = coords.latitude;
                longitude = coords.longitude;
            }
        }

        const updatePayload = {
            title: eventEditForm.title,
            description: eventEditForm.description,
            address: eventEditForm.address,
            latitude,
            longitude
        };

        // 1. Optimistic UI Update (Instant UI change!)
        updateEventDetails({ ...updatePayload, id: selectedEventDetails.id }, activeDateStr);

        // 2. Fire TanStack Mutation
        editEventMutation.mutate({
            eventId: selectedEventDetails.id,
            updatePayload: updatePayload
        });

        // 3. Close modal instantly
        handleCloseDetails();
    };

    const showTimePicker = (itemId) => {
        setSelectedItemId(itemId);
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
        setSelectedItemId(null);
    };

    const handleConfirmTime = (formattedTime) => {
        if (!activeDateStr || !selectedItemId) return;
        updateEventTime(selectedItemId, activeDateStr, formattedTime); 
        hideTimePicker();
    };

    const handleRemoveEvent = (item) => {
        if (!activeDateStr) return;
        unassignEvent(item.id, activeDateStr); 
    };

    const handleDeleteEvent = (item) => {
        if (!activeDateStr) return;
        deleteEvent(item.id, activeDateStr); 
    };

    const reorderBucket = ({ from, to }) => {
        if (!activeDateStr) return;
        const reorderedAnytime = reorderItems(flexibleBucket, from, to);
        updateDayEvents(activeDateStr, [...reorderedAnytime, ...anchoredTimeline]);
    };

    const handleAddEventToBucket = (item) => {
        if (activeDateStr) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            addEventToBucket(activeDateStr, item);
        }
    };

    // ==========================================
    // RETURN
    // ==========================================
    return {
        // state
        selectedDate,
        isTimePickerVisible,
        isIdeaBankVisible,
        selectedEventDetails,
        isEditingEvent,
        eventEditForm,
        isSavingEvent: editEventMutation.isPending, 

        // derived data
        dateList,
        flexibleBucket,
        anchoredTimeline,
        unassignedIdeas,

        // actions
        setSelectedDate,
        setIdeaBankVisible,
        setIsEditingEvent,
        setEventEditForm,
        showTimePicker,
        hideTimePicker,
        handleConfirmTime,
        handleViewDetails,
        handleCloseDetails,
        handleSaveEventDetails,
        handleRemoveEvent,
        handleDeleteEvent,
        reorderBucket,
        handleAddEventToBucket
    };
}