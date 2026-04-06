export const fakeUpcomingTrips = [
  {
    id: "77777777-7777-7777-7777-777777777777",
    title: "Japan 2026",
    destinations: "Kyoto, Japan",
    start_date: "2026-05-10",
    end_date: "2026-05-20",
    readinessPercent: 60,
    group: [
      { id: 1, name: "Alice B.", initials: "AB", profileColor: "#1E90FF", active: false },
      { id: 2, name: "Hunter S.", initials: "HS", profileColor: "#32CD32", active: true },
      { id: 3, name: "Maria K.", initials: "MK", profileColor: "#FFA500", active: true },
    ],
    image: require("../../assets/images/japan.png"),
  },
  {
    id: "paris-2026",
    title: "Paris 2026",
    destinations: "Paris, France",
    start_date: "2026-06-02",
    end_date: "2026-06-09",
    readinessPercent: 40,
    group: [
      { id: 4, name: "David L.", initials: "DL", profileColor: "#FF4500", active: true },
      { id: 5, name: "Chris T.", initials: "CT", profileColor: "#8A2BE2", active: false },
    ],
    image: require("../../assets/images/paris.png"),
  },
];