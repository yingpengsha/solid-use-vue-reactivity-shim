import { batch, For, onCleanup, Show, type Component } from "solid-js";
import { computed, reactive, ref, toRaw } from "@vue/reactivity";

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

const tuple = <T extends string[]>(...args: T) => args;

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const SHOW_MODES = tuple("all", "active", "completed");
type ShowModes = typeof SHOW_MODES[number];

const TodoApp: Component = () => {
  const showMode = ref<ShowModes>("all");
  const counter = ref(1);
  const editingTodoId = ref<number>();
  const todoList = reactive<Todo[]>([
    { id: counter.value++, title: "Use Solid 1", completed: false },
    { id: counter.value++, title: "Use Solid 2", completed: true },
    { id: counter.value++, title: "Use Solid 3", completed: false },
    { id: counter.value++, title: "Use Solid 4", completed: true }
  ]);
  const remainingCount = computed(() => todoList.length - todoList.filter((todo) => todo.completed).length);

  const filterList = computed(() => {
    if (showMode.value === "active")
      return todoList.filter((todo) => !todo.completed);
    else if (showMode.value === "completed")
      return todoList.filter((todo) => todo.completed);
    else return todoList;
  });

  // ======================== user events ========================
  const removeTodo = (todoId: number) => {
    const index = todoList.findIndex((todo) => todo.id === todoId);
    console.log(index, ...todoList)
    if (index !== -1) todoList.splice(index, 1);
  };
  const editTodo = (todo: Partial<Todo>) => {
    const index = todoList.findIndex((t) => t.id === todo.id);
    if (index !== -1) todoList[index] = { ...todoList[index], ...todo };
  };
  const clearCompleted = () =>
    batch(() => {
      const completedTodoList = toRaw(todoList).filter((todo) => todo.completed)
      completedTodoList.forEach((todo) => removeTodo(todo.id))
    });
  const toggleAll = (completed: boolean) => todoList.forEach((todo) => (todo.completed = completed));
  const setEditing = (todoId?: number) => (editingTodoId.value = todoId);

  const addTodo = ({ target, keyCode }: KeyboardEvent) => {
    const title = target.value.trim();
    if (keyCode === ENTER_KEY && title) {
      todoList.unshift({ title, id: counter.value++, completed: false });
      counter.value++;
      target.value = "";
    }
  };
  const save = (todoId: number, { target: { value } }: Event) => {
    const title = value.trim();
    if (editingTodoId.value === todoId && title) {
      editTodo({ id: todoId, title });
      setEditing();
    }
  };
  const toggle = (todoId: number, { target: { checked } }: InputEvent) =>
    editTodo({ id: todoId, completed: checked });

  const doneEditing = (todoId: number, e: KeyboardEvent) => {
    if (e.keyCode === ENTER_KEY) save(todoId, e);
    else if (e.keyCode === ESCAPE_KEY) setEditing();
  };

  // ======================== watch route change ========================
  const locationHandler = () => {
    const loc = location.hash.slice(2) as ShowModes;
    showMode.value = SHOW_MODES.includes(loc) ? loc : "all";
  };
  window.addEventListener("hashchange", locationHandler);
  onCleanup(() => window.removeEventListener("hashchange", locationHandler));

  return (
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          class="new-todo"
          placeholder="What needs to be done?"
          onKeyDown={addTodo}
        />
      </header>

      <Show when={todoList.length > 0}>
        <section class="main">
          <input
            id="toggle-all"
            class="toggle-all"
            type="checkbox"
            checked={!remainingCount.value}
            onInput={({ target: { checked } }) => toggleAll(checked)}
          />
          <label for="toggle-all" />
          <ul class="todo-list">
            <For each={filterList.value}>
              {(todo) => (
                <li
                  class="todo"
                  classList={{
                    editing: editingTodoId.value === todo.id,
                    completed: todo.completed,
                  }}
                >
                  <div class="view">
                    <input
                      class="toggle"
                      type="checkbox"
                      checked={todo.completed}
                      onInput={[toggle, todo.id]}
                    />
                    <label onDblClick={[setEditing, todo.id]}>
                      {todo.title}
                    </label>
                    <button class="destroy" onClick={[removeTodo, todo.id]} />
                  </div>
                  <Show when={editingTodoId.value === todo.id}>
                    <input
                      class="edit"
                      value={todo.title}
                      onFocusOut={[save, todo.id]}
                      onKeyUp={[doneEditing, todo.id]}
                    />
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </section>

        <footer class="footer">
          <span class="todo-count">
            <strong>{remainingCount.value}</strong>{" "}
            {remainingCount.value === 1 ? " item " : " items "} left
          </span>
          <ul class="filters">
            <li>
              <a href="#/" classList={{ selected: showMode.value === "all" }}>
                All
              </a>
            </li>
            <li>
              <a
                href="#/active"
                classList={{ selected: showMode.value === "active" }}
              >
                Active
              </a>
            </li>
            <li>
              <a
                href="#/completed"
                classList={{ selected: showMode.value === "completed" }}
              >
                Completed
              </a>
            </li>
          </ul>
          <Show when={remainingCount.value !== todoList.length}>
            <button class="clear-completed" onClick={clearCompleted}>
              Clear completed
            </button>
          </Show>
        </footer>
      </Show>
    </section>
  );
};

export default TodoApp;
