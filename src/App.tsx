import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { sendLoginNotification } from "./utils/snsClient";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut, authStatus } = useAuthenticator();

  useEffect(() => {
    if (authStatus === "authenticated" && user?.signInDetails?.loginId) {
      // Add small delay to ensure auth is fully established
      setTimeout(() => {
        // @ts-ignore
        sendLoginNotification(user.signInDetails.loginId).catch((error) =>
          console.error("Failed to send login notification:", error)
        );
      }, 1000);
    }
  }, [authStatus, user]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
            {todo.content}
          </li>
        ))}
      </ul>
      <div>🥳 App successfully hosted. Try creating a new todo.</div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
