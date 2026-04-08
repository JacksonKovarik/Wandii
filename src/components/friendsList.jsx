import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function Avatar({ buddy, isFirst }) {
  const hasImage = typeof buddy?.avatar === 'string' && buddy.avatar;

  if (hasImage) {
    return (
      <Image
        source={{ uri: buddy.avatar }}
        style={[styles.avatar, isFirst && styles.firstAvatar]}
      />
    );
  }

  return (
    <View style={[styles.initialsCircle, isFirst && styles.firstAvatar]}>
      <Text style={styles.initialsText}>{getInitials(buddy?.name || buddy?.username || 'W')}</Text>
    </View>
  );
}

export default function FriendsList({ buddies, onPressMore }) {
  const visible = (buddies || []).slice(0, 4);
  const remaining = Math.max((buddies || []).length - visible.length, 0);

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Travel Buddies</Text>

        <TouchableOpacity onPress={onPressMore}>
          <Text style={styles.seeAll}>View All ›</Text>
        </TouchableOpacity>
      </View>

      {visible.length > 0 ? (
        <View style={styles.row}>
          {visible.map((buddy, index) => (
            <Avatar
              key={buddy.id || buddy.user_id || `${buddy.name}-${index}`}
              buddy={buddy}
              isFirst={index === 0}
            />
          ))}

          {remaining > 0 && (
            <View style={styles.moreCircle}>
              <Text style={styles.moreText}>+{remaining}</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No connections yet</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
  },
  seeAll: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8820',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -18,
  },
  initialsCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#FFD7AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -18,
  },
  initialsText: {
    fontWeight: '800',
    color: '#B45309',
  },
  firstAvatar: {
    marginLeft: 0,
  },
  moreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreText: {
    fontWeight: '700',
    color: '#4B5563',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    color: '#6B7280',
    fontWeight: '600',
  },
});
