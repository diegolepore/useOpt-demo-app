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

  const [todos, setTodos] = useState([]);  // 1️⃣ The state for the todos in our component (source of truth)
  const [newTodo, setNewTodo] = useState('');
  // const [isPending, setIsPending] = useState(false); // 2️⃣ an "isPending" state is no longer needed as it will be provided by useTransition

  useEffect(() => {
    fetchTodos().then(setTodos)
  }, [])

  // 3️⃣ "useOptimistic"
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos, 
    // updateFn
    (currentState, newTodo) => [
      // merge and return new state with optimistic value
      ...currentState,
      { id: Math.random().toString(36).slice(2), text: newTodo }
    ]); 

  
  // 4️⃣ "useTransition"
  const [
    isPending, // The isPending flag that tells you whether there is a pending Transition.
    startTransition // The startTransition function that lets you mark a state update as a Transition.
  ] = useTransition();

  
  async function addNewTodo() { // 5️⃣ Fucntion to add a new todo

    setOptimisticTodos(newTodo); // Update the optimistic state

    try {
      await addTodo(newTodo); // add todo enpoint is intentionally 3seconds slow
      setTodos(await fetchTodos()); // Update the real state once the request is successful
    } catch (error) {
      console.log(error);
    } finally {
      setNewTodo('');
    }
  }

  return (
    <>
      <h1>Optimistic todos</h1>
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
              // 6️⃣ Mark the state update as a Transition
              // Because this state update is marked as a Transition, a slow re-render won't freeze the user interface
              // A state update marked as a Transition will be interrupted by other state updates with a higher priority, like a user typing on an input.
              // In our case, if a user starts typing into an input while the todos are in the middle of a re-render, 
              // React will restart the rendering work on the todos after handling the input update.
              startTransition(() => addNewTodo());
            }
          }}
        />
      </div>
    </>
  )
}

export default App
