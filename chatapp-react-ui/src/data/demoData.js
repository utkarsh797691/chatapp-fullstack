export const seedContacts = [
  { id: "alice", name: "Alice", initial: "A", avatar: "sky", online: true, lastSeen: "10:24 AM" },
  { id: "bob", name: "Bob", initial: "B", avatar: "mint", online: false, lastSeen: "9:15 AM" },
  { id: "charlie", name: "Charlie", initial: "C", avatar: "teal", online: false, lastSeen: "Yesterday" },
  { id: "david", name: "David", initial: "D", avatar: "blue", online: false, lastSeen: "Yesterday" },
  { id: "emma", name: "Emma", initial: "E", avatar: "green", online: true, lastSeen: "Oct 5" },
  { id: "frank", name: "Frank", initial: "F", avatar: "indigo", online: false, lastSeen: "Oct 4" },
];

export const seedMessages = {
  alice: [
    { id: "a1", mine: false, text: "Hey! How are you?", time: "10:24 AM" },
    { id: "a2", mine: true, text: "Hi Alice! I'm good.", time: "10:25 AM" },
    { id: "a3", mine: true, text: "Just working on a project.", time: "10:25 AM" },
    { id: "a4", mine: false, text: "That's awesome! 🚀", time: "10:26 AM" },
    { id: "a5", mine: false, text: "Are you free later?", time: "10:27 AM" },
    { id: "a6", mine: true, text: "Yes, I am. Let's talk later!", time: "10:27 AM" },
  ],
  bob: [{ id: "b1", mine: false, text: "Let's catch up later.", time: "9:15 AM" }],
  charlie: [{ id: "c1", mine: false, text: "Okay, thanks!", time: "Yesterday" }],
  david: [{ id: "d1", mine: false, text: "See you soon!", time: "Yesterday" }],
  emma: [{ id: "e1", mine: false, text: "That's great!", time: "Oct 5" }],
  frank: [{ id: "f1", mine: false, text: "No problem!", time: "Oct 4" }],
};
