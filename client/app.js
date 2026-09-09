const { createApp, ref, computed, watch, onMounted, nextTick } = Vue;

// Translations
const translations = {
  mk: {
    heroTitle: 'Твоите дневни навики',
    heroSubtitle: 'Следи ги твоите навики секој ден и изгради подобра рутина.',
    completedToday: 'завршени денес',
    longestStreak: 'најдолг низ',
    totalCompletions: 'вкупно завршени',
    today: 'Денес',
    addHabit: 'Додај навика',
    addHabitHint: 'Внеси нешто што сакаш да го правиш секој ден — на пр. „Пиј вода" или „Читај 10 мин".',
    habitName: 'Име на навиката',
    habitPlaceholder: 'пр. Вежбање наутро',
    chooseIcon: 'Избери икона',
    chooseColor: 'Избери боја',
    addHabitBtn: 'Додади навика',
    saving: 'Се зачувува...',
    loading: 'Се вчитуваат навиките...',
    noHabits: 'Немаш навики',
    noHabitsHint: 'Започни со додавање на твојата прва навика од левата страна.',
    deleteHabit: 'Избриши навика',
    completedBtn: 'Завршено ✓',
    markComplete: 'Означи за денес',
    weeklyStats: 'Статистика за неделата',
    weeklyStatsHint: 'Колку навики се исполнети во секој од последните 7 дена.',
    streakDay: 'ден низ',
    streakDays: 'дена низ',
    noStreak: 'започни денес!',
    days: ['Не', 'По', 'Вт', 'Ср', 'Че', 'Пе', 'Са'],
    months: ['јануари', 'февруари', 'март', 'април', 'мај', 'јуни', 'јули', 'август', 'септември', 'октомври', 'ноември', 'декември'],
    confirmDeleteTitle: 'Избриши навика?',
    confirmDeleteMessage: 'Сигурно сакаш да ја избришеш оваа навика?',
    cancel: 'Откажи',
    delete: 'Избриши',
    footerNote: '✨ Мали чекори секој ден водат до големи промени ✨'
  },
  en: {
    heroTitle: 'Your Daily Habits',
    heroSubtitle: 'Track your habits every day and build a better routine.',
    completedToday: 'completed today',
    longestStreak: 'longest streak',
    totalCompletions: 'total completions',
    today: 'Today',
    addHabit: 'Add Habit',
    addHabitHint: 'Enter something you want to do every day — e.g. "Drink water" or "Read 10 min".',
    habitName: 'Habit name',
    habitPlaceholder: 'e.g. Morning exercise',
    chooseIcon: 'Choose icon',
    chooseColor: 'Choose color',
    addHabitBtn: 'Add habit',
    saving: 'Saving...',
    loading: 'Loading habits...',
    noHabits: 'No habits yet',
    noHabitsHint: 'Start by adding your first habit from the left side.',
    deleteHabit: 'Delete habit',
    completedBtn: 'Completed ✓',
    markComplete: 'Mark for today',
    weeklyStats: 'Weekly Statistics',
    weeklyStatsHint: 'How many habits were completed each day in the last 7 days.',
    streakDay: 'day streak',
    streakDays: 'days streak',
    noStreak: 'start today!',
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    confirmDeleteTitle: 'Delete habit?',
    confirmDeleteMessage: 'Are you sure you want to delete this habit?',
    cancel: 'Cancel',
    delete: 'Delete',
    footerNote: '✨ Small steps every day lead to big changes ✨'
  }
};

createApp({
  setup() {
    // Language
    const lang = ref(localStorage.getItem('habit-lang') || 'mk');
    
    const t = (key) => translations[lang.value][key] || key;
    
    const toggleLanguage = () => {
      lang.value = lang.value === 'mk' ? 'en' : 'mk';
      localStorage.setItem('habit-lang', lang.value);
    };

    // State
    const habits = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const errorMessage = ref('');
    
    // Modal state
    const showConfirmModal = ref(false);
    const habitToDelete = ref(null);
    
    // Form
    const newHabitName = ref('');
    const newHabitColor = ref('#6366f1');
    const newHabitIcon = ref('💪');
    
    // Options
    const palette = [
      '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b',
      '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#64748b'
    ];
    
    const icons = ['💪', '📚', '💧', '🏃', '🧘', '✍️', '🎯', '💤', '🍎', '🎵', '💻', '🌿'];

    // Chart
    const chartCanvas = ref(null);
    let chartInstance = null;

    // Computed
    const todayKey = computed(() => {
      const d = new Date();
      return d.toISOString().split('T')[0];
    });

    const todayLabel = computed(() => {
      const d = new Date();
      const dayNames = lang.value === 'mk' 
        ? ['Недела', 'Понеделник', 'Вторник', 'Среда', 'Четврток', 'Петок', 'Сабота']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = translations[lang.value].months;
      return `${dayNames[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
    });

    const lastSevenDays = computed(() => {
      const days = [];
      const dayLabels = translations[lang.value].days;
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({
          key: d.toISOString().split('T')[0],
          short: dayLabels[d.getDay()],
          label: d.toLocaleDateString(lang.value === 'mk' ? 'mk-MK' : 'en-US'),
          isToday: i === 0
        });
      }
      return days;
    });

    const doneTodayCount = computed(() => {
      return habits.value.filter(h => isDone(h, todayKey.value)).length;
    });

    const longestStreak = computed(() => {
      let max = 0;
      habits.value.forEach(h => {
        const streak = getStreak(h);
        if (streak > max) max = streak;
      });
      return max;
    });

    const totalCompletions = computed(() => {
      return habits.value.reduce((sum, h) => sum + (h.completedDates?.length || 0), 0);
    });

    // Methods
    const isDone = (habit, dateKey) => {
      return habit.completedDates?.includes(dateKey);
    };

    const getStreak = (habit) => {
      if (!habit.completedDates || habit.completedDates.length === 0) return 0;
      
      const sorted = [...habit.completedDates].sort().reverse();
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i <= sorted.length; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const checkKey = checkDate.toISOString().split('T')[0];
        
        if (sorted.includes(checkKey)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
      return streak;
    };

    const streakText = (habit) => {
      const streak = getStreak(habit);
      if (streak === 0) return t('noStreak');
      if (streak === 1) return `1 ${t('streakDay')}`;
      return `${streak} ${t('streakDays')}`;
    };

    // API calls
    const API_BASE = '/api';

    const fetchHabits = async () => {
      loading.value = true;
      try {
        const res = await fetch(`${API_BASE}/habits`);
        if (!res.ok) throw new Error('Failed to fetch');
        habits.value = await res.json();
      } catch (err) {
        console.error(err);
        errorMessage.value = lang.value === 'mk' 
          ? 'Грешка при вчитување на навиките'
          : 'Error loading habits';
      } finally {
        loading.value = false;
      }
    };

    const addHabit = async () => {
      if (!newHabitName.value || saving.value) return;
      
      saving.value = true;
      try {
        const res = await fetch(`${API_BASE}/habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newHabitName.value,
            color: newHabitColor.value,
            icon: newHabitIcon.value
          })
        });
        
        if (!res.ok) throw new Error('Failed to create');
        
        const habit = await res.json();
        habits.value.unshift(habit);
        newHabitName.value = '';
        newHabitIcon.value = '💪';
        
      } catch (err) {
        console.error(err);
        errorMessage.value = lang.value === 'mk'
          ? 'Грешка при додавање на навиката'
          : 'Error adding habit';
      } finally {
        saving.value = false;
      }
    };

    const removeHabit = (id) => {
      const habit = habits.value.find(h => h._id === id);
      if (habit) {
        habitToDelete.value = habit;
        showConfirmModal.value = true;
      }
    };
    
    const cancelDelete = () => {
      showConfirmModal.value = false;
      habitToDelete.value = null;
    };
    
    const confirmDelete = async () => {
      if (!habitToDelete.value) return;
      
      const id = habitToDelete.value._id;
      showConfirmModal.value = false;
      
      try {
        const res = await fetch(`${API_BASE}/habits/${id}`, {
          method: 'DELETE'
        });
        
        if (!res.ok) throw new Error('Failed to delete');
        
        habits.value = habits.value.filter(h => h._id !== id);
      } catch (err) {
        console.error(err);
        errorMessage.value = lang.value === 'mk'
          ? 'Грешка при бришење'
          : 'Error deleting habit';
      } finally {
        habitToDelete.value = null;
      }
    };

    const toggleDay = async (habit, dateKey) => {
      try {
        const res = await fetch(`${API_BASE}/habits/${habit._id}/toggle`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateKey })
        });
        
        if (!res.ok) throw new Error('Failed to toggle');
        
        const updated = await res.json();
        const idx = habits.value.findIndex(h => h._id === habit._id);
        if (idx !== -1) {
          habits.value[idx] = updated;
        }
      } catch (err) {
        console.error(err);
        errorMessage.value = lang.value === 'mk'
          ? 'Грешка при означување'
          : 'Error toggling completion';
      }
    };

    // Chart
    const updateChart = () => {
      if (!chartCanvas.value || habits.value.length === 0) return;
      
      const ctx = chartCanvas.value.getContext('2d');
      const labels = lastSevenDays.value.map(d => d.short);
      const data = lastSevenDays.value.map(day => {
        return habits.value.filter(h => isDone(h, day.key)).length;
      });

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: lang.value === 'mk' ? 'Завршени навики' : 'Completed habits',
            data,
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: Math.max(habits.value.length, 5),
              ticks: {
                stepSize: 1,
                color: '#94a3b8'
              },
              grid: {
                color: 'rgba(148, 163, 184, 0.1)'
              }
            },
            x: {
              ticks: {
                color: '#94a3b8'
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    };

    // Watchers
    watch(habits, () => {
      nextTick(updateChart);
    }, { deep: true });

    watch(lang, () => {
      nextTick(updateChart);
    });

    // Lifecycle
    onMounted(() => {
      fetchHabits();
    });

    return {
      // Language
      lang,
      t,
      toggleLanguage,
      
      // State
      habits,
      loading,
      saving,
      errorMessage,
      
      // Modal
      showConfirmModal,
      habitToDelete,
      cancelDelete,
      confirmDelete,
      
      // Form
      newHabitName,
      newHabitColor,
      newHabitIcon,
      palette,
      icons,
      
      // Computed
      todayKey,
      todayLabel,
      lastSevenDays,
      doneTodayCount,
      longestStreak,
      totalCompletions,
      
      // Methods
      isDone,
      streakText,
      addHabit,
      removeHabit,
      toggleDay,
      
      // Refs
      chartCanvas
    };
  }
}).mount('#app');
