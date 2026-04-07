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

const cleanData = (obj) => {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
};

export const createHabit = async (data) => {
  const cleaned = cleanData(data);
  const docRef = await addDoc(collection(db, 'habits'), { ...cleaned, completedDays: [] });
  return formatRes({ _id: docRef.id, ...cleaned, completedDays: [] });
};

export const updateHabit = async (id, data) => {
  const cleaned = cleanData(data);
  await updateDoc(doc(db, 'habits', id), cleaned);
  return formatRes({ _id: id, ...cleaned });
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
  // Invalidate cache so next fetch gets fresh data
  habitsPromise = null;
  return formatRes({ success: true });
};

export const getTodayHabits = async () => {
  const today = new Date().toISOString().split('T')[0];
  const shortDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  const habitsRes = await getHabits();
  const todayHabits = habitsRes.data.data
    .filter(h => 
      !h.active ? false : h.type === 'daily' || (h.type === 'custom' && h.days?.includes(shortDay))
    )
    .map(h => ({
      ...h,
      completed: h.completedDays?.includes(today) || false
    }));
  return formatRes(todayHabits);
};

export const getWeeklyStats = async () => {
  const habitsRes = await getHabits();
  const habits = habitsRes.data.data;
  
  const week = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const applicableHabits = habits.filter(h => 
      h.active && (h.type === 'daily' || (h.type === 'custom' && h.days?.includes(dayName)))
    );
    
    const total = applicableHabits.length;
    const completed = applicableHabits.filter(h => h.completedDays?.includes(dateStr)).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    week.push({ day: dayName, percentage, completed, total });
  }

  return formatRes({ week, habits });
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
      filtered = filtered.filter(t => 
        t.date === params.date || (t.date < params.date && t.status !== 'done')
      );
    }
    return formatRes(filtered);
  });
};

export const createTask = async (data) => {
  const cleaned = cleanData(data);
  const docRef = await addDoc(collection(db, 'tasks'), cleaned);
  return formatRes({ _id: docRef.id, ...cleaned });
};

export const updateTask = async (id, data) => {
  const cleaned = cleanData(data);
  await updateDoc(doc(db, 'tasks', id), cleaned);
  return formatRes({ _id: id, ...cleaned });
};

export const deleteTask = async (id) => {
  await deleteDoc(doc(db, 'tasks', id));
  return formatRes({ success: true });
};

export default {
  get: () => Promise.resolve(),
  post: () => Promise.resolve(),
};
