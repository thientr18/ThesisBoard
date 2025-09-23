import { useEffect, useState } from "react";
import { getUsers, createUser } from "../api/userApi";

interface User {
  id: number;
  name: string;
}

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    getUsers().then((data) => setUsers(data as User[]));
  }, []);

  const handleAddUser = async () => {
    if (!newName.trim()) return;
    const newUser = await createUser(newName) as User;
    setUsers([...users, newUser]);
    setNewName("");
  };

  return (
    <div>
      <h2>User List</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.name}</li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Enter name"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
      />
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
}

export default Users;
