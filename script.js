// SECTION: State & Persistence
const STORAGE_KEY = "calmplate-state-v1";

const defaultFoods = [
  { name: "Alpro yoghurt", safety: "safe", noDairy: true, highProtein: false, takeout: false, kcal: 90, notes: "Plant-based. Any Alpro yoghurt that feels okay.", stock: 1 },
  { name: "Açaí bowl", safety: "mostly-safe", noDairy: true, highProtein: false, takeout: true, kcal: 350, notes: "Best when toppings are predictable.", stock: 0 },
  { name: "Toastie", safety: "safe", noDairy: true, highProtein: true, takeout: false, kcal: 320, notes: "Simple toastie with safe cheese substitute.", stock: 2 },
  { name: "Mango smoothie", safety: "safe", noDairy: true, highProtein: false, takeout: false, kcal: 180, notes: "Cold and smooth.", stock: 1 },
  { name: "Coffee", safety: "safe", noDairy: true, highProtein: false, takeout: true, kcal: 5, notes: "With safe plant milk only.", stock: 10 },
  { name: "Pizza (no cheese)", safety: "can-eat", noDairy: true, highProtein: false, takeout: true, kcal: 500, notes: "Takeout is okay if hungry and stuck.", stock: 0 },
  { name: "Pringles", safety: "safe", noDairy: true, highProtein: false, takeout: false, kcal: 150, notes: "Crispy, predictable.", stock: 3 },
  { name: "Vegaburger", safety: "mostly-safe", noDairy: true, highProtein: true, takeout: true, kcal: 280, notes: "With very familiar sides.", stock: 1 },
  { name: "Gyoza", safety: "neutral", noDairy: true, highProtein: false, takeout: true, kcal: 260, notes: "Best if same brand / restaurant.", stock: 0 },
  { name: "Quesadilla (no cheese)", safety: "can-eat", noDairy: true, highProtein: false, takeout: true, kcal: 300, notes: "Use safe fillings only.", stock: 0 },
  { name: "Rice/noodle bowl", safety: "safe", noDairy: true, highProtein: true, takeout: true, kcal: 420, notes: "Plain, with chosen safe toppings.", stock: 1 },
  { name: "Ninja Creami protein ice cream", safety: "safe", noDairy: true, highProtein: true, takeout: false, kcal: 250, notes: "Good comfort option.", stock: 1 },
  { name: "Fruit mix", safety: "safe", noDairy: true, highProtein: false, takeout: false, kcal: 80, notes: "Pick fruits that feel okay.", stock: 4 },
  { name: "Oreos", safety: "safe", noDairy: true, highProtein: false, takeout: false, kcal: 140, notes: "Predictable snack.", stock: 2 },
  { name: "Lotus biscuits", safety: "safe", noDairy: true, highProtein: false, takeout: false, kcal: 120, notes: "With safe drink.", stock: 2 },
  { name: "KitKat (plant-based)", safety: "mostly-safe", noDairy: true, highProtein: false, takeout: false, kcal: 220, notes: "Only plant version.", stock: 1 },
  { name: "Kinder chocolate (limited)", safety: "can-eat", noDairy: false, highProtein: false, takeout: false, kcal: 120, notes: "Only if stomach feels okay.", stock: 0 },
  { name: "Almond milk", safety: "safe", noDairy: true, highProtein:1, takeout: false, kcal: 40, notes: "Base for drinks.", stock: 2 },
  { name: "Sproud milk", safety: "safe", noDairy: true, highProtein:1, takeout: false, kcal: 50, notes: "Barista version.", stock: 2 },
  { name: "Soy milk", safety: "safe", noDairy: true, highProtein:1, takeout: false, kcal: 60, notes: "For cereal / drinks.", stock: 3 }
];

let state = {
  foods: [],
  meals: [],
  plans: [],
  challenges: [],
  settings: {
    showKcal: false,
    timeSuggestions: false,
    noDairy: true,
    proteinFocus: false,
    onlyInStock: false
  },
  ui: {
    selectedPlanDay: null
  }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.foods = defaultFoods.map((f, id) => ({ id: `f-${id + 1}`, ...f }));
      saveState();
      return;
    }
    const parsed = JSON.parse(raw);
    state = {
      foods: parsed.foods || [],
      meals: parsed.meals || [],
      plans: parsed.plans || [],
      challenges: parsed.challenges || [],
      settings: { ...state.settings, ...(parsed.settings || {}) },
      ui: parsed.ui || { selectedPlanDay: null }
    };
  } catch (e) {
    console.error("Failed to load state", e);
    state.foods = defaultFoods.map((f, id) => ({ id: `f-${id + 1}`, ...f }));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// SECTION: DOM Helpers
function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// SECTION: Tabs
function initTabs() {
  const navButtons = document.querySelectorAll(".nav-item");
  const panels = document.querySelectorAll(".tab-panel");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tabTarget;
      navButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      panels.forEach((p) => {
        p.classList.toggle("is-hidden", p.dataset.tab !== target);
      });
    });
  });
}

// SECTION: Rendering
function renderFoods() {
  const list = $("#foods-list");
  const search = $("#food-search").value.toLowerCase();
  const activeChip = document.querySelector(".chip.is-active");
  const safetyFilter = activeChip ? activeChip.dataset.safety : "all";

  list.innerHTML = "";

  const { noDairy, proteinFocus, onlyInStock } = state.settings;

  state.foods
    .filter((f) => {
      if (search && !f.name.toLowerCase().includes(search)) return false;
      if (safetyFilter !== "all" && f.safety !== safetyFilter) return false;
      if (noDairy && !f.noDairy) return false;
      if (proteinFocus && !f.highProtein) return false;
      if (onlyInStock && (!f.stock || f.stock <= 0)) return false;
      return true;
    })
    .forEach((food) => {
      const li = createEl("li", "list-item-card");

      const titleRow = createEl("div", "item-title-row");
      const title = createEl("h4", "item-title", food.name);
      const meta = createEl("div", "item-meta");

      const safetyBadge = createEl(
        "span",
        `badge ${
          food.safety === "safe"
            ? "badge-safe"
            : food.safety === "mostly-safe"
            ? "badge-safe"
            : food.safety === "neutral"
            ? "badge-neutral"
            : "badge-can-eat"
        }`,
        food.safety === "safe"
          ? "Safe"
          : food.safety === "mostly-safe"
          ? "Mostly safe"
          : food.safety === "neutral"
          ? "Neutral"
          : "Can eat"
      );
      meta.appendChild(safetyBadge);

      if (food.takeout) {
        const take = createEl("span", "badge badge-takeout", "Takeout ok");
        meta.appendChild(take);
      }

      if (state.settings.showKcal && typeof food.kcal === "number") {
        const kcal = createEl("span", "badge badge-soft", `${food.kcal} kcal`);
        meta.appendChild(kcal);
      }

      if (food.stock > 0) {
        const stock = createEl("span", "badge badge-soft", `In stock: ${food.stock}`);
        meta.appendChild(stock);
      }

      if (food.highProtein) {
        const hp = createEl("span", "badge badge-soft", "Protein");
        meta.appendChild(hp);
      }

      titleRow.appendChild(title);
      titleRow.appendChild(meta);
      li.appendChild(titleRow);

      if (food.notes) {
        const notes = createEl("p", "item-notes", food.notes);
        notes.style.margin = "0";
        notes.style.fontSize = "0.8rem";
        notes.style.color = "#64748b";
        li.appendChild(notes);
      }

      list.appendChild(li);
    });
}

function getWeekDays() {
  const today = new Date();
  const dayIndex = today.getDay(); // 0 = Sunday
  const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push({
      date: d,
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })
    });
  }
  return days;
}

function renderPlans() {
  const strip = document.querySelector("#week-day-strip");
  const dayContainer = document.querySelector("#day-plan");
  if (!strip || !dayContainer) return;

  const days = getWeekDays();

  if (!state.ui.selectedPlanDay) {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayInWeek = days.find((d) => d.key === todayKey);
    state.ui.selectedPlanDay = (todayInWeek || days[0]).key;
  }

  strip.innerHTML = "";
  days.forEach((day) => {
    const btn = createEl(
      "button",
      "week-day-btn" + (day.key === state.ui.selectedPlanDay ? " is-selected" : ""),
      day.label
    );
    btn.type = "button";
    btn.dataset.date = day.key;
    btn.addEventListener("click", () => {
      state.ui.selectedPlanDay = day.key;
      const daySelect = document.querySelector("#plan-day-select");
      if (daySelect) daySelect.value = day.key;
      saveState();
      renderPlans();
    });
    strip.appendChild(btn);
  });

  dayContainer.innerHTML = "";
  const selectedDay = days.find((d) => d.key === state.ui.selectedPlanDay) || days[0];

  const slots = [
    { id: "breakfast", label: "Breakfast", icon: "☕" },
    { id: "lunch", label: "Lunch", icon: "🍽" },
    { id: "dinner", label: "Dinner", icon: "🌙" },
    { id: "snack", label: "Snack", icon: "🍪" },
    { id: "snack2", label: "Snack 2 / drink", icon: "🥤" }
  ];

  slots.forEach((slot) => {
    const slotData = state.plans.find((p) => p.date === selectedDay.key && p.mealType === slot.id);
    const row = createEl("button", "day-slot-row" + (slotData ? "" : " is-empty"));
    row.type = "button";
    row.dataset.date = selectedDay.key;
    row.dataset.slot = slot.id;

    const icon = createEl("div", "day-slot-icon", slot.icon);
    const content = createEl("div", "day-slot-content");
    const title = createEl("div", "day-slot-title", slot.label);
    const subtitle = createEl(
      "div",
      "day-slot-subtitle",
      slotData ? slotData.foodName : "Tap to add"
    );

    content.appendChild(title);
    content.appendChild(subtitle);
    row.appendChild(icon);
    row.appendChild(content);

    row.addEventListener("click", () => {
      const daySelect = document.querySelector("#plan-day-select");
      const slotSelect = document.querySelector("#plan-slot-select");
      if (daySelect && slotSelect) {
        daySelect.value = selectedDay.key;
        slotSelect.value = slot.id;
      }
    });

    dayContainer.appendChild(row);
  });
}

function renderChallenges() {
  const list = $("#challenges-list");
  list.innerHTML = "";

  state.challenges.forEach((c, index) => {
    const li = createEl("li", "list-item-card");
    if (c.done) li.classList.add("challenge-done");

    const row = createEl("div", "item-title-row");
    row.appendChild(createEl("h4", "item-title", `Level ${index + 1}: ${c.title}`));
    list.appendChild(row);

    const meta = createEl("div", "item-meta");
    if (c.foodName) meta.appendChild(createEl("span", "badge badge-soft", c.foodName));
    if (c.createdAt)
      meta.appendChild(
        createEl(
          "span",
          "badge badge-soft",
          new Date(c.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        )
      );
    li.appendChild(meta);

    const xp = createEl(
      "div",
      "challenge-xp",
      c.done ? "+1 XP – Completed" : "0 XP – In progress"
    );
    li.appendChild(xp);

    if (c.steps) {
      const steps = createEl("p", "item-notes", c.steps);
      steps.style.margin = "0";
      steps.style.fontSize = "0.8rem";
      steps.style.color = "#64748b";
      li.appendChild(steps);
    }

    const actions = createEl("div", "challenge-actions");
    const doneBtn = createEl(
      "button",
      "btn btn-secondary btn-sm",
      c.done ? "Undo" : "Complete"
    );
    doneBtn.addEventListener("click", () => {
      c.done = !c.done;
      saveState();
      renderChallenges();
    });
    const deleteBtn = createEl("button", "btn btn-ghost btn-sm", "Delete");
    deleteBtn.addEventListener("click", () => {
      state.challenges = state.challenges.filter((x) => x.id !== c.id);
      saveState();
      renderChallenges();
    });
    actions.appendChild(doneBtn);
    actions.appendChild(deleteBtn);
    li.appendChild(actions);

    list.appendChild(li);
  });
}

function renderTodaySummary() {
  const container = $("#today-summary");
  container.innerHTML = "";
  const todayKey = new Date().toISOString().slice(0, 10);
  const meals = state.meals.filter((m) => m.date === todayKey);

  const totalMeals = meals.length;
  const safeMeals = meals.filter(
    (m) => m.safety === "safe" || m.safety === "mostly-safe"
  ).length;

  const pill1 = createEl("div", "summary-pill");
  pill1.innerHTML = `<strong>${totalMeals}</strong> meals logged today`;
  const pill2 = createEl("div", "summary-pill");
  pill2.innerHTML = `<strong>${safeMeals}</strong> felt mostly or fully safe`;

  container.appendChild(pill1);
  container.appendChild(pill2);
}

function renderTodayMeals() {
  const list = $("#today-meals-list");
  list.innerHTML = "";
  const todayKey = new Date().toISOString().slice(0, 10);
  const meals = state.meals.filter((m) => m.date === todayKey);

  meals.forEach((m) => {
    const li = createEl("li", "list-item-card");
    const titleRow = createEl("div", "item-title-row");
    const title = createEl("h4", "item-title", m.name || "Meal");
    const meta = createEl("div", "item-meta");

    meta.appendChild(createEl("span", "badge badge-soft", m.mealType));
    if (m.safety) {
      meta.appendChild(createEl("span", "badge badge-soft", m.safety));
    }
    if (state.settings.showKcal && typeof m.kcal === "number") {
      meta.appendChild(createEl("span", "badge badge-soft", `${m.kcal} kcal`));
    }

    titleRow.appendChild(title);
    titleRow.appendChild(meta);
    li.appendChild(titleRow);

    if (m.notes) {
      const notes = createEl("p", "item-notes", m.notes);
      notes.style.margin = "0";
      notes.style.fontSize = "0.8rem";
      notes.style.color = "#64748b";
      li.appendChild(notes);
    }

    list.appendChild(li);
  });
}

function renderSelectOptions() {
  const foodSelect = $("#plan-food-select");
  const challengeFood = $("#challenge-food");
  const daySelect = $("#plan-day-select");

  if (!foodSelect || !challengeFood || !daySelect) return;

  foodSelect.innerHTML = "";
  challengeFood.innerHTML = "";
  daySelect.innerHTML = "";

  const days = getWeekDays();
  days.forEach((d) => {
    const opt = createEl("option", "", d.label);
    opt.value = d.key;
    daySelect.appendChild(opt);
  });

  const empty = createEl("option", "", "(Optional)");
  empty.value = "";
  challengeFood.appendChild(empty.cloneNode(true));

  state.foods.forEach((f) => {
    const opt1 = createEl("option", "", f.name);
    opt1.value = f.id;
    foodSelect.appendChild(opt1);

    const opt2 = createEl("option", "", f.name);
    opt2.value = f.id;
    challengeFood.appendChild(opt2);
  });
}

function renderAll() {
  renderFoods();
  renderSelectOptions();
  renderPlans();
  renderChallenges();
  renderTodaySummary();
  renderTodayMeals();
}

// SECTION: Forms & Events
function initForms() {
  $("#food-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#food-name").value.trim();
    if (!name) return;
    const food = {
      id: `f-${Date.now()}`,
      name,
      safety: $("#food-safety").value,
      noDairy: $("#food-no-dairy").checked,
      highProtein: $("#food-protein").checked,
      takeout: $("#food-takeout").checked,
      kcal: $("#food-kcal").value ? Number($("#food-kcal").value) : undefined,
      notes: $("#food-notes").value.trim(),
      stock: Number($("#food-stock").value || 0)
    };
    state.foods.push(food);
    saveState();
    e.target.reset();
    renderAll();
  });

  $("#quick-meal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#quick-meal-name").value.trim();
    if (!name) return;
    const mealType = $("#quick-meal-time").value;
    const notes = $("#quick-meal-notes").value.trim();

    const meal = {
      id: `m-${Date.now()}`,
      name,
      mealType,
      notes,
      date: new Date().toISOString().slice(0, 10)
    };

    const matchingFood = state.foods.find((f) =>
      name.toLowerCase().includes(f.name.toLowerCase())
    );
    if (matchingFood) {
      meal.safety = matchingFood.safety;
      meal.kcal = matchingFood.kcal;
    }

    state.meals.push(meal);
    saveState();
    e.target.reset();
    renderTodaySummary();
    renderTodayMeals();
  });

  $("#plan-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = $("#plan-day-select").value;
    const mealType = $("#plan-slot-select").value;
    const foodId = $("#plan-food-select").value;
    const notes = $("#plan-notes").value.trim();

    const food = state.foods.find((f) => f.id === foodId);

    state.plans = state.plans.filter(
      (p) => !(p.date === date && p.mealType === mealType)
    );

    state.plans.push({
      id: `p-${Date.now()}`,
      date,
      mealType,
      foodId: food ? food.id : undefined,
      foodName: food ? food.name : notes || "Planned meal",
      kcal: food ? food.kcal : undefined,
      notes
    });

    saveState();
    renderPlans();
    e.target.reset();
  });

  $("#challenge-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#challenge-title").value.trim();
    if (!title) return;
    const foodId = $("#challenge-food").value;
    const steps = $("#challenge-steps").value.trim();
    const food = state.foods.find((f) => f.id === foodId);

    state.challenges.push({
      id: `c-${Date.now()}`,
      title,
      foodId: food ? food.id : undefined,
      foodName: food ? food.name : undefined,
      steps,
      createdAt: new Date().toISOString(),
      done: false
    });

    saveState();
    e.target.reset();
    renderChallenges();
  });

  $("#food-search").addEventListener("input", renderFoods);
  document.querySelectorAll("#safety-filter-chips .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document
        .querySelectorAll("#safety-filter-chips .chip")
        .forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      renderFoods();
    });
  });

  $("#quick-add-meal").addEventListener("click", () => {
    document.querySelector('[data-tab-target="home"]').click();
    $("#quick-meal-name").focus();
  });

  $("#quick-add-food").addEventListener("click", () => {
    document.querySelector('[data-tab-target="foods"]').click();
    $("#food-name").focus();
  });
}

// SECTION: Settings & Toggles
function initSettings() {
  const kcalToggle = $("#kcal-toggle");
  const timeToggle = $("#time-suggestion-toggle");
  const noDairyFilter = $("#no-dairy-filter");
  const proteinFilter = $("#protein-filter");
  const inStockFilter = $("#in-stock-filter");

  kcalToggle.checked = state.settings.showKcal;
  timeToggle.checked = state.settings.timeSuggestions;
  noDairyFilter.checked = state.settings.noDairy;
  proteinFilter.checked = state.settings.proteinFocus;
  inStockFilter.checked = state.settings.onlyInStock;

  kcalToggle.addEventListener("change", () => {
    state.settings.showKcal = kcalToggle.checked;
    saveState();
    renderAll();
  });

  timeToggle.addEventListener("change", () => {
    state.settings.timeSuggestions = timeToggle.checked;
    saveState();
  });

  noDairyFilter.addEventListener("change", () => {
    state.settings.noDairy = noDairyFilter.checked;
    saveState();
    renderFoods();
  });

  proteinFilter.addEventListener("change", () => {
    state.settings.proteinFocus = proteinFilter.checked;
    saveState();
    renderFoods();
  });

  inStockFilter.addEventListener("change", () => {
    state.settings.onlyInStock = inStockFilter.checked;
    saveState();
    renderFoods();
  });
}

// SECTION: Suggestions & Automation
function getCurrentMealType() {
  if (!state.settings.timeSuggestions) return "auto";
  const hour = new Date().getHours();
  if (hour <= 10) return "breakfast";
  if (hour <= 14) return "lunch";
  if (hour <= 18) return "snack";
  return "dinner";
}

function buildSuggestionPool(mealType) {
  const { noDairy, proteinFocus, onlyInStock } = state.settings;

  return state.foods.filter((f) => {
    if (noDairy && !f.noDairy) return false;
    if (proteinFocus && !f.highProtein) return false;
    if (onlyInStock && (!f.stock || f.stock <= 0)) return false;
    return ["safe", "mostly-safe", "can-eat", "neutral"].includes(f.safety);
  });
}

function suggestMeal() {
  const output = $("#suggestion-output");
  const selectType = $("#suggestion-meal-type").value;

  const mealType = selectType === "auto" ? getCurrentMealType() : selectType;
  const pool = buildSuggestionPool(mealType);

  if (!pool.length) {
    output.textContent =
      "No matching foods right now with current filters. Try turning off a filter or adding a new food.";
    return;
  }

  const food = pool[Math.floor(Math.random() * pool.length)];

  const baseText = `How about ${food.name}?`;
  const ideaParts = [];

  if (mealType === "breakfast") {
    ideaParts.push("You could pair it with coffee or safe drink.");
  } else if (mealType === "lunch" || mealType === "dinner") {
    ideaParts.push("Consider a simple plate: just this food and one familiar side.");
  } else if (mealType === "snack") {
    ideaParts.push("Keep it small and predictable as a snack.");
  }

  if (food.stock <= 0) {
    ideaParts.push("Add it to your grocery list so it's ready for another day.");
  }

  const recipeHint =
    "If it feels okay, keep the recipe the same each time so it stays predictable.";

  output.textContent = `${baseText} ${ideaParts.join(" ")} ${recipeHint}`;
}

function initSuggestions() {
  $("#suggest-btn").addEventListener("click", suggestMeal);
}

// SECTION: Init
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  initTabs();
  initForms();
  initSettings();
  initSuggestions();
  renderAll();

  const daySelect = document.querySelector("#plan-day-select");
  if (daySelect) {
    if (!state.ui.selectedPlanDay) {
      const days = getWeekDays();
      state.ui.selectedPlanDay = days[0].key;
    }
    daySelect.value = state.ui.selectedPlanDay;
    daySelect.addEventListener("change", () => {
      state.ui.selectedPlanDay = daySelect.value;
      saveState();
      renderPlans();
    });
  }
});
