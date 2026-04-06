import { supabase } from "@/src/lib/supabase";
import DateUtils from "@/src/utils/DateUtils";
import { getCoordinatesForAddress } from "@/src/utils/LocationUtils";
import { useTrip } from "@/src/utils/TripContext";
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from "react";
import { reorderItems } from 'react-native-reorderable-list';

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
    const { 
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

    const [selectedDate, setSelectedDate] = useState(null);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [isIdeaBankVisible, setIdeaBankVisible] = useState(false); 
    const [selectedEventDetails, setSelectedEventDetails] = useState(null);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [eventEditForm, setEventEditForm] = useState({});

    const activeDateStr = useMemo(() => selectedDate ? DateUtils.formatDateToYYYYMMDD(selectedDate) : null, [selectedDate]);
    const dateList = useMemo(() => DateUtils.getDatesBetween(startDate, endDate), [startDate, endDate]);

    useEffect(() => {
        if (startDate && !selectedDate) {
            setSelectedDate(DateUtils.parseYYYYMMDDToDate(startDate));
        }
    }, [startDate, selectedDate]);

    const currentDayData = useMemo(() => activeDateStr ? (timelineData[activeDateStr] || []) : [], [activeDateStr, timelineData]);
    
    const flexibleBucket = useMemo(() => currentDayData.filter(e => !e.time || e.time === 'TBD' || e.time === 'All Day'), [currentDayData]);
    
    const anchoredTimeline = useMemo(() => currentDayData
        .filter(e => e.time && e.time !== 'TBD' && e.time !== 'All Day')
        .sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)), [currentDayData]);

    const handleViewDetails = (item) => {
        setSelectedEventDetails(item);
        setEventEditForm(item); 
        setIsEditingEvent(false); 
    };

    const handleCloseDetails = () => {
        setSelectedEventDetails(null);
        setIsEditingEvent(false);
    };

    const handleSaveEventDetails = async () => {
        try {
            const hasTitleChanged = eventEditForm.title !== selectedEventDetails.title;
            const hasDescChanged = eventEditForm.description !== selectedEventDetails.description;
            const hasAddressChanged = eventEditForm.address !== selectedEventDetails.address;

            if (!hasTitleChanged && !hasDescChanged && !hasAddressChanged) {
                setIsEditingEvent(false);
                return; 
            }
            
            const { latitude, longitude } = await getCoordinatesForAddress(eventEditForm.address, destination);
            const updatedData = {
                title: eventEditForm.title,
                description: eventEditForm.description,
                address: eventEditForm.address,
                latitude: latitude || null,
                longitude: longitude || null
            };

            const { error } = await supabase
                .from('Events')
                .update(updatedData)
                .eq('event_id', eventEditForm.event_id || eventEditForm.id); 

            if (error) throw error;

            const finalizedEvent = { ...eventEditForm, ...updatedData };
            setSelectedEventDetails(finalizedEvent);
            setIsEditingEvent(false); 
            
            if (updateEventDetails) {
                updateEventDetails(finalizedEvent, activeDateStr);
            }
            
        } catch (error) {
            console.error("Failed to save event details:", error);
            alert("Could not save changes. Please try again.");
        }
    };

    const showTimePicker = (itemId) => {
        setSelectedItemId(itemId);
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
        setSelectedItemId(null);
    };

    const handleConfirmTime = (date) => {
        if (!selectedItemId || !activeDateStr) return;

        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; 
        const formattedTime = `${hours}:${minutes < 10 ? `0${minutes}` : minutes} ${ampm}`;

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

    return {
        // state
        selectedDate,
        isTimePickerVisible,
        isIdeaBankVisible,
        selectedEventDetails,
        isEditingEvent,
        eventEditForm,

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
        handleAddEventToBucket,
    };
}