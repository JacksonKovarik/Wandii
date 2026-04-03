const UpcomingTripCard = ({ trip, onDelete }) => {
  return (
    <Link href={`/(trip-info)/${trip.id}/overview`} asChild>
      <TouchableOpacity style={styles.card}>

        <Image
          source={typeof trip.image === "string" ? { uri: trip.image } : trip.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={styles.cardImage}
        />

        {/* location tag */}
        <View style={[styles.subtitleRow, { position: "absolute", top: 10, right: 10 }]}>
          <BlurView
            intensity={20}
            tint="default"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
              borderRadius: 20,
              backgroundColor: "rgba(255,255,255,0.38)",
              overflow: "hidden",
            }}
          />
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={moderateScale(14)}
            color="white"
          />
          <Text style={styles.cardSubtitle}>{trip.destinations}</Text>
        </View>

        {/* card content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{trip.title}</Text>

          {/* date range */}
          <View style={styles.dateRow}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={moderateScale(14)}
              color={Colors.textSecondary}
            />
            <Text style={styles.dateRange}>
              {DateUtils.formatRange(
                DateUtils.parseYYYYMMDDToDate(trip.start_date),
                DateUtils.parseYYYYMMDDToDate(trip.end_date)
              )}
            </Text>
          </View>

          {/* status */}
          <View style={styles.progressHeader}>
            <Text style={[styles.progressText, { color: Colors.textSecondary }]}>
              Status
            </Text>
            <Text style={[styles.progressText, { color: Colors.primary }]}>
              {DateUtils.daysUntil(DateUtils.parseYYYYMMDDToDate(trip.start_date)) === 0
                ? "Trip is starting"
                : `Takeoff in ${DateUtils.daysUntil(
                    DateUtils.parseYYYYMMDDToDate(trip.start_date)
                  )} days`}
            </Text>
          </View>

          {/* progress bar */}
          <ProgressBar
            width="100%"
            height={moderateScale(8)}
            progress={`${trip.readinessPercent ?? 60}%`}
            backgroundColor="#F3F3F3"
          />

          <View style={styles.divider} />

          {/* group avatars */}
          <GroupDisplay members={trip.group || []} />

          {/* menu */}
          <View style={styles.menuWrap}>
            <Menu>
              <MenuTrigger style={{ padding: 10 }}>
                <MaterialIcons name="more-vert" size={moderateScale(20)} color="grey" />
              </MenuTrigger>
              <MenuOptions customStyles={{ optionsContainer: styles.menuOptionsContainer }}>
                <MenuOption
                  onSelect={() => onDelete(trip.id)}
                  customStyles={{
                    optionWrapper: {
                      padding: 10,
                      flexDirection: "row",
                      gap: 6,
                      alignItems: "center",
                    },
                  }}
                >
                  <MaterialIcons name="delete-outline" size={20} color="red" />
                  <Text style={{ fontSize: moderateScale(14), color: "red", fontWeight: "600" }}>
                    Delete
                  </Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};