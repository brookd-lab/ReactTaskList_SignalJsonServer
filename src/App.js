import { effect, signal } from "@preact/signals-react";
import "./App.css";
import Task from "./Components/Task";
import Tasks from "./Components/Tasks";

function App() {
  const tasks = signal([]);
  const input = signal("");
  const port = 3000;

  const getData = () => {
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    fetch(`http://localhost:${port}/tasks`, requestOptions)
      .then((response) => response.json())
      .then((result) => (tasks.value = result))
      .catch((error) => console.log("error", error));
  };

  effect(() => {
    getData();
  });

  const addTask = () => {
    let newTask;
    if (tasks.value.length === 0) {
      newTask = {
        id: 1,
        name: input.value,
        reminder: false,
      };
    } else
      newTask = {
        id: tasks.value[tasks.value.length - 1].id + 1,
        name: input.value,
        reminder: false,
      };
    fetch(`http://localhost:${port}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    })
      .then((resp) => {
        if (resp.ok) {
          return resp.json();
        } else {
          throw Error("Failed to create task.");
        }
      })
      .then((newTaskFromServer) => {
        tasks.value = [...tasks.value, newTaskFromServer];
        input.value = "";
      });
  };

  const removeTask = (id) => {
    fetch(`http://localhost:${port}/tasks/${id}`, {
      method: "DELETE",
    }).then((resp) => {
      if (resp.ok) {
        tasks.value = tasks.value.filter((task) => task.id !== id);
      }
    });
  };

  const setReminder = (id) => {
    const newTask = tasks.value.find((task) => task.id === id);
    const newTaskIndex = tasks.value.findIndex((task) => task.id === id);
    newTask.reminder = !newTask.reminder;
    const newTasks = [...tasks.value];
    newTasks[newTaskIndex] = newTask;

    fetch(`http://localhost:${port}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    }).then((res) => {
      if (res.ok) {
        tasks.value = newTasks;
      } else {
        throw Error("Failed to create task.");
      }
    });
  };

  return (
    <div
      className="container-fluid mt-5 text-center card border-0"
      style={{ width: "350px", height: "500px" }}
    >
      <h3 className="mb-3 card-title">
        <i>Tasks</i>
      </h3>
      <Task input={input} addTask={addTask} className="mb-3 card-body" />
      <Tasks
        tasks={tasks}
        removeTask={removeTask}
        setReminder={setReminder}
        className="text-center card-text"
      />
    </div>
  );
}

export default App;
