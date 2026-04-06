import { StyleSheet, Text, View } from "react-native";

// 1. Pass the index so we know which items need to overlap
const MemberIdentifier = ({ member, index }) => {
    return (
        <View style={[
            styles.circleBase, 
            index > 0 && styles.overlap // Don't apply negative margin to the very first item
        ]}>
            <Text style={styles.text}>{member.id}</Text>
        </View>
    );
};

export const GroupDisplay = ({ members }) => {
    // 3. Set your limit and calculate the remainder
    const MAX_DISPLAY = 4;
    const visibleMembers = members.slice(0, MAX_DISPLAY);
    const remainingCount = members.length - MAX_DISPLAY;

    return (
        <View style={styles.container}>
            {/* Render the visible members */}
            {visibleMembers.map((member, index) => (
                <MemberIdentifier key={member.id} member={member} index={index} />
            ))}

            {/* Render the "+X" indicator if there are left over members */}
            {remainingCount > 0 && (
                <View style={[styles.circleBase, styles.overlap, styles.overflowBackground]}>
                    <Text style={styles.overflowText}>+{remainingCount}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    circleBase: {
        width: 40, 
        height: 40, 
        borderRadius: 20, 
        borderWidth: 2, // Bumped to 2 for a more distinct separator
        borderColor: 'white', 
        backgroundColor: 'grey',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlap: {
        marginLeft: -12, // This is the magic number that pulls the circles over each other
    },
    overflowBackground: {
        backgroundColor: '#333333', // Darker background for the remainder circle
    },
    text: {
        color: 'white',
    },
    overflowText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    }
});