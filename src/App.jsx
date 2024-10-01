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

  const [todos, setTodos] = useState([]); // 1️⃣ The state for the todos in our component
  const [newTodo, setNewTodo] = useState('');
  const [isPending, setIsPending] = useState(false); // 2️⃣ isPending state to use it for the loading indicator


  useEffect(() => {
    fetchTodos().then(setTodos)
  }, [])

  
  async function addNewTodo() { // 3️⃣ Fucntion to add a new todo
    setIsPending(true);

    try {
      await addTodo(newTodo); // This is being intentially delayed to 3 seconds.
      const todos = await fetchTodos(); // Then we fecth our todos again (there are for sure better ways to do this, but is just an example).
      setTodos(todos); // Finally, after the delay, we update our state
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
      <div>
        
        {/* 
          4️⃣ Input for adding new todo 
          - Use `onKeyUp` to add a new todo when `Enter` is pressed
          - Use `disabled` to disable the input if `isPending` is true
          - And also show a loading indicator if `isPending` is true
        */}

        {isPending && <p>Loading...</p>}
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
