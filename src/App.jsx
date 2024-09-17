import { useState, useEffect, useOptimistic, useTransition } from 'react'

async function fetchTodos() {
  const response = await fetch('http://localhost:8080/api/todos')
  const todos = await response.json()
  return todos
}

async function addTodo(text) {
  const response = await fetch('http://localhost:8080/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if(!response.ok) {
    throw new Error('Failed to add todo')
  }

  const todo = await response.json()
  return todo
}

function App() {

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');


  useEffect(() => {
    fetchTodos().then(setTodos)
  }, [])

  const [optimisticTodos, setOptimisticTodos] = useOptimistic(todos);

  const [isPending, startTransition] = useTransition();

  
  async function addNewTodo() {
    setOptimisticTodos((todos) => [
      ...todos,
      { id: Math.random().toString(36).slice(2), text: newTodo }
    ]);

    try {
      await addTodo(newTodo);
      setTodos(await fetchTodos());
    } catch (error) {
      console.log(error);
    } finally {
      setNewTodo('');
    }
  }

  return (
    <>
      <ul>
        {optimisticTodos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
      <div>
        <input
          type='text'
          value={newTodo}
          disabled={isPending}
          onChange={e => setNewTodo(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              startTransition(() => addNewTodo());
            }
          }}
        />
      </div>
    </>
  )
}

export default App
