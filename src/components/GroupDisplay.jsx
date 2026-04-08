import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

const MemberIdentifier = ({ member, index }) => {
    member = member.Users
    const firstInitial = member.first_name[0] || "?";
    const lastInitial = member.last_name[0] || "?";

    return (
        <View>
            {member.avatar_url ? (
                <Image 
                    source={{ uri: member.avatar_url }}
                    style={[ 
                        styles.circleBase, 
                        index > 0 && styles.overlap
                    ]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                />
            ) : (
                <View style={[
                    styles.circleBase, 
                    styles.noAvatarBackground,
                    index > 0 && styles.overlap // Don't apply negative margin to the very first item
                ]}>
                    <Text style={styles.text}>{firstInitial}{lastInitial}</Text>
                </View>
            )}
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
                <MemberIdentifier key={member.user_id} member={member} index={index} />
            ))}

      {/* 5th spot logic */}
      {members.length <= MAX_DISPLAY ? (
        // If 5 or fewer members → show the 5th normally
        visibleMembers[4] && (
          <MemberIdentifier
            member={visibleMembers[4]}
            index={4}
          />
        )
      ) : (
        // If more than 5 → show +X circle
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
    },
    noAvatarBackground: {
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