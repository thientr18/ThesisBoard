interface User {
  id: number;
  name: string;
}

let users: User[] = [
  { id: 1, name: "Student A" },
  { id: 2, name: "Teacher B" }
];

export const getAllUsers = (): User[] => {
  return users;
};

export const createUser = (name: string): User => {
  const newUser: User = { id: users.length + 1, name };
  users.push(newUser);
  return newUser;
};
