// groups items alphabetically by first letter of name
export const groupByLetter = (friends) => {
  const grouped = friends.reduce((acc, friend) => {
    const letter = friend.name[0].toUpperCase();
    if (!acc[letter]) acc[letter] = { title: letter, data: [] };
    acc[letter].data.push(friend);
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
};