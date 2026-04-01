import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

// Helper to mimic Axios JSON response
const formatRes = (data) => ({ data: { data } });

// Cached promises to deduplicate parallel requests
let habitsPromise = null;

export const getHabits = () => {
  if (!habitsPromise) {
    habitsPromise = getDocs(collection(db, 'habits')).then(snapshot => {
      const habits = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      
      // Clear cache after 1 second
      setTimeout(() => { habitsPromise = null; }, 1000);
      return formatRes(habits);
    });
  }
  return habitsPromise;
};

export const createHabit = async (data) => {
  const docRef = await addDoc(collection(db, 'habits'), { ...data, completedDays: [] });
  return formatRes({ _id: docRef.id, ...data, completedDays: [] });
};

export const updateHabit = async (id, data) => {
  await updateDoc(doc(db, 'habits', id), data);
  return formatRes({ _id: id, ...data });
};

export const deleteHabit = async (id) => {
  await deleteDoc(doc(db, 'habits', id));
  return formatRes({ success: true });
};

// --- Habit Logs ---

export const logHabit = async ({ habitId, date, completed }) => {
  const habitRef = doc(db, 'habits', habitId);
  await updateDoc(habitRef, {
    completedDays: completed ? arrayUnion(date) : arrayRemove(date)
  });
  return formatRes({ success: true });
};

export const getTodayHabits = async () => {
  const shortDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const habitsRes = await getHabits();
  const todayHabits = habitsRes.data.data.filter(h => 
    !h.active ? false : h.type === 'daily' || (h.type === 'custom' && h.days?.includes(shortDay))
  );
  return formatRes(todayHabits);
};

export const getWeeklyStats = async () => {
  const habitsRes = await getHabits();
  return formatRes({ habits: habitsRes.data.data });
};

// --- Tasks ---

let tasksPromise = null;

export const getTasks = (params) => {
  if (!tasksPromise) {
    tasksPromise = getDocs(collection(db, 'tasks')).then(snapshot => {
      let tasks = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
      setTimeout(() => { tasksPromise = null; }, 1000);
      return tasks;
    });
  }

  return tasksPromise.then(allTasks => {
    let filtered = allTasks;
    if (params?.date) {
      filtered = filtered.filter(t => t.date === params.date);
    }
    return formatRes(filtered);
  });
};

export const createTask = async (data) => {
  const docRef = await addDoc(collection(db, 'tasks'), data);
  return formatRes({ _id: docRef.id, ...data });
};

export const updateTask = async (id, data) => {
  await updateDoc(doc(db, 'tasks', id), data);
  return formatRes({ _id: id, ...data });
};

export const deleteTask = async (id) => {
  await deleteDoc(doc(db, 'tasks', id));
  return formatRes({ success: true });
};

export default {
  get: () => Promise.resolve(),
  post: () => Promise.resolve(),
};
