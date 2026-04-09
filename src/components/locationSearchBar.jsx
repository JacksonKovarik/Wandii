import { Colors } from "@/src/constants/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { moderateScale } from "react-native-size-matters";

export default function LocationSearchBar({ onSelect, placeholder = "Search for a city..." }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const LOCATION_IQ_KEY = 'pk.29ba43c85df756ee6924d2cf82e92464'; // Insert your key here
        const url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (Array.isArray(data)) {
            setSearchResults(data);
            setShowDropdown(true);
        } else {
            setSearchResults([]);
            setShowDropdown(false);
        }
      } catch (error) {
        console.error("LocationIQ Search Error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 800); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleItemPress = (item) => {
    setShowDropdown(false);
    setSearchQuery("");
    // Pass the selected item back to the parent component
    if (onSelect) {
        onSelect(item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <MaterialIcons name="search" size={24} color={Colors.textSecondary} style={{ marginRight: 8 }}/>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        {isSearching && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {showDropdown && searchResults.length > 0 && (
        <View style={styles.dropdown}>
          {searchResults.map((item, index) => {
            const nameParts = item.display_name.split(', ');
            const title = nameParts[0];
            const subtitle = nameParts.slice(1, nameParts.length).join(', ');

            return (
              <TouchableOpacity 
                key={item.place_id || index} 
                style={styles.dropdownRow}
                onPress={() => handleItemPress(item)}
              >
                <MaterialIcons name="location-city" size={20} color={Colors.primary} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.dropdownTitle}>{title}</Text>
                    <Text style={styles.dropdownSubtitle} numberOfLines={1}>{subtitle}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
          <Text style={styles.attribution}>Search by LocationIQ.com</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 999, // Ensures the dropdown floats above everything in the parent
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    height: moderateScale(50),
  },
  input: { 
    flex: 1,
    fontSize: moderateScale(16), 
    color: Colors.darkBlue, 
  },
  dropdown: {
    position: 'absolute',
    top: moderateScale(55),
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    maxHeight: moderateScale(250),
    paddingVertical: moderateScale(8),
    zIndex: 1000,
  },
  dropdownRow: {
    flexDirection: 'row',
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.lightGray,
  },
  dropdownTitle: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: Colors.darkBlue,
  },
  dropdownSubtitle: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attribution: {
    fontSize: moderateScale(10),
    color: Colors.textSecondaryLight,
    textAlign: 'center',
    paddingTop: moderateScale(8),
    fontStyle: 'italic'
  }
});