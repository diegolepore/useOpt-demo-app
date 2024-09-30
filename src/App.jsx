import { useState, useEffect } from 'react'

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
  const [isPending, setIsPending] = useState(false);


  useEffect(() => {
    fetchTodos().then(setTodos)
  }, [])

  
  async function addNewTodo() {
    setIsPending(true);

    try {
      await addTodo(newTodo);
      const todos = await fetchTodos();
      setTodos(todos);
    } catch (error) { 
      console.log(error);
    } finally {
      setNewTodo('');
      setIsPending(false);
    }
  }

  return (
    <>
      <ul>
        {todos.map(todo => <li key={todo.id}>{todo.text}</li>)}
      </ul>
      {isPending && <p>Loading...</p>}
      <div>
        <input
          type='text'
          value={newTodo}
          disabled={isPending}
          onChange={e => setNewTodo(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              addNewTodo();
            }
          }}
        />
      </div>
    </>
  )
}

export default App
