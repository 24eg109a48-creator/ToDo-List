import TaskManager from '../components/TaskManager.jsx';

export default function Tasks() {
  return (
    <>
      <div className="page-header">
        <h1>My tasks</h1>
        <p>Search, filter and sort everything you have to do.</p>
      </div>

      <TaskManager />
    </>
  );
}
