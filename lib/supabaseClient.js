import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("tu-proyecto") &&
    !supabaseAnonKey.includes("tu-anon-key") &&
    (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
);

// Fallback in-memory and localStorage store for preview and local development
function createInitialStore() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const defaultBarber = {
    id: "barber-demo-1",
    business_name: "Estudio Marco",
    slug: "estudio-marco",
    business_type: "ambos",
    phone: "+34 612 345 678",
    city: "Madrid",
    address: "Calle Fuencarral 42, 28004 Madrid",
    instagram: "@estudiomarco",
    opening_time_morning: "10:00",
    closing_time_morning: "14:00",
    has_siesta: true,
    opening_time_afternoon: "16:30",
    closing_time_afternoon: "20:30",
    work_days: [1, 2, 3, 4, 5, 6], // 1=Lunes a 6=Sábado (Domingo cerrado)
    slot_interval: 30,
    currency: "EUR",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  };

  const defaultServices = [
    {
      id: "srv-1",
      barber_id: "barber-demo-1",
      name: "Corte de pelo clásico",
      duration_minutes: 30,
      price: 18,
      active: true,
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: "srv-2",
      barber_id: "barber-demo-1",
      name: "Arreglo de barba tradicional",
      duration_minutes: 20,
      price: 12,
      active: true,
      created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    },
    {
      id: "srv-3",
      barber_id: "barber-demo-1",
      name: "Corte completo y barba",
      duration_minutes: 45,
      price: 25,
      active: true,
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ];

  const defaultClients = [
    {
      id: "cli-1",
      barber_id: "barber-demo-1",
      full_name: "Carlos Mendoza",
      phone: "+34 654 987 321",
      notes: "Degradado medio en los laterales, tijera arriba.",
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
      id: "cli-2",
      barber_id: "barber-demo-1",
      full_name: "Alejandro Ruiz",
      phone: "+34 677 889 900",
      notes: "Piel sensible. Aceite de eucalipto para la barba.",
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: "cli-3",
      barber_id: "barber-demo-1",
      full_name: "David Gómez",
      phone: "+34 611 223 344",
      notes: "Viene cada 3 semanas puntualmente.",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];

  const defaultStaff = [
    {
      id: "stf-1",
      barber_id: "barber-demo-1",
      name: "Marco",
      role: "Master Barber",
      avatar_color: "#4f46e5",
      phone: "+34 612 345 678",
      active: true,
      created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    },
    {
      id: "stf-2",
      barber_id: "barber-demo-1",
      name: "Dani",
      role: "Especialista Fade & Degradados",
      avatar_color: "#059669",
      phone: "+34 622 334 455",
      active: true,
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    },
    {
      id: "stf-3",
      barber_id: "barber-demo-1",
      name: "Carlos",
      role: "Barbas y Estilo Clásico",
      avatar_color: "#d97706",
      phone: "+34 633 445 566",
      active: true,
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
  ];

  const defaultAppointments = [
    {
      id: "apt-1",
      barber_id: "barber-demo-1",
      client_id: "cli-1",
      service_id: "srv-1",
      staff_id: "stf-1",
      starts_at: new Date(y, m, d, 10, 30).toISOString(),
      ends_at: new Date(y, m, d, 11, 0).toISOString(),
      status: "completada",
      payment_method: "bizum",
      payment_status: "pagado",
      tip_amount: 2,
      total_price: 18,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "apt-2",
      barber_id: "barber-demo-1",
      client_id: "cli-2",
      service_id: "srv-3",
      staff_id: "stf-2",
      starts_at: new Date(y, m, d, 11, 30).toISOString(),
      ends_at: new Date(y, m, d, 12, 15).toISOString(),
      status: "completada",
      payment_method: "efectivo",
      payment_status: "pagado",
      tip_amount: 0,
      total_price: 25,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "apt-3",
      barber_id: "barber-demo-1",
      client_id: "cli-3",
      service_id: "srv-2",
      staff_id: "stf-3",
      starts_at: new Date(y, m, d, 12, 30).toISOString(),
      ends_at: new Date(y, m, d, 12, 50).toISOString(),
      status: "confirmada",
      payment_method: null,
      payment_status: "pendiente",
      tip_amount: 0,
      total_price: 12,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "apt-4",
      barber_id: "barber-demo-1",
      client_id: "cli-1",
      service_id: "srv-3",
      staff_id: "stf-1",
      starts_at: new Date(y, m, d, 17, 0).toISOString(),
      ends_at: new Date(y, m, d, 17, 45).toISOString(),
      status: "confirmada",
      payment_method: null,
      payment_status: "pendiente",
      tip_amount: 0,
      total_price: 25,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "apt-5",
      barber_id: "barber-demo-1",
      client_id: "cli-2",
      service_id: "srv-1",
      staff_id: "stf-2",
      starts_at: new Date(y, m, d, 18, 0).toISOString(),
      ends_at: new Date(y, m, d, 18, 30).toISOString(),
      status: "confirmada",
      payment_method: null,
      payment_status: "pendiente",
      tip_amount: 0,
      total_price: 18,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return {
    users: [{ id: "barber-demo-1", email: "demo@barberia.es" }],
    currentUser: { id: "barber-demo-1", email: "demo@barberia.es" },
    barbers: [defaultBarber],
    barber_staff: defaultStaff,
    services: defaultServices,
    clients: defaultClients,
    appointments: defaultAppointments,
  };
}

let mockStore = null;

function getStore() {
  if (!mockStore) {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("calendario_mock_store");
        if (saved) {
          mockStore = JSON.parse(saved);
        }
      } catch (e) {
        // ignore localStorage access error
      }
    }
    if (!mockStore) {
      mockStore = createInitialStore();
    }
  }

  // Ensure barber_staff exists in stored state
  if (!mockStore.barber_staff || mockStore.barber_staff.length === 0) {
    const initial = createInitialStore();
    mockStore.barber_staff = initial.barber_staff;
    saveStore();
  }

  return mockStore;
}

function saveStore() {
  if (typeof window !== "undefined" && mockStore) {
    try {
      localStorage.setItem("calendario_mock_store", JSON.stringify(mockStore));
    } catch (e) {
      // ignore
    }
  }
}

function createMockQueryBuilder(tableName) {
  const store = getStore();
  let filters = [];
  let sortField = null;
  let sortAscending = true;
  let isSingle = false;
  let selectFields = "*";
  let insertedRecords = null;
  let updatePayload = null;
  let isDelete = false;

  const builder = {
    select(fields = "*") {
      selectFields = fields;
      return builder;
    },
    eq(column, value) {
      filters.push((item) => String(item[column]) === String(value));
      return builder;
    },
    gte(column, value) {
      filters.push((item) => new Date(item[column]).getTime() >= new Date(value).getTime());
      return builder;
    },
    lte(column, value) {
      filters.push((item) => new Date(item[column]).getTime() <= new Date(value).getTime());
      return builder;
    },
    order(column, { ascending = true } = {}) {
      sortField = column;
      sortAscending = ascending;
      return builder;
    },
    single() {
      isSingle = true;
      return builder;
    },
    delete() {
      isDelete = true;
      return builder;
    },
    insert(newRecords) {
      const records = Array.isArray(newRecords) ? newRecords : [newRecords];
      const created = [];
      if (!store[tableName]) store[tableName] = [];

      for (const rec of records) {
        const item = {
          id: rec.id || `${tableName.slice(0, 3)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          created_at: rec.created_at || new Date().toISOString(),
          ...rec,
        };
        store[tableName].push(item);
        created.push(item);
      }
      saveStore();
      insertedRecords = Array.isArray(newRecords) ? created : created[0];
      return builder;
    },
    update(updateData) {
      updatePayload = updateData;
      return builder;
    },
    then(onFulfilled, onRejected) {
      return executeQuery().then(onFulfilled, onRejected);
    },
    catch(onRejected) {
      return executeQuery().catch(onRejected);
    },
  };

  async function executeQuery() {
    if (isDelete) {
      if (store[tableName]) {
        store[tableName] = store[tableName].filter((item) => !filters.every((fn) => fn(item)));
        saveStore();
      }
      return { data: null, error: null };
    }

    if (updatePayload) {
      if (store[tableName]) {
        store[tableName] = store[tableName].map((item) => {
          const match = filters.every((fn) => fn(item));
          if (match) {
            return { ...item, ...updatePayload };
          }
          return item;
        });
        saveStore();
      }
      return { data: null, error: null };
    }

    if (insertedRecords !== null) {
      return { data: insertedRecords, error: null };
    }

    let items = (store[tableName] || []).slice();
    for (const filterFn of filters) {
      items = items.filter(filterFn);
    }

    if (sortField) {
      items.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAscending ? valA - valB : valB - valA;
        }
        const strA = String(valA || "");
        const strB = String(valB || "");
        return sortAscending ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    // Handle nested relation expansion if requested
    const processedItems = items.map((item) => {
      const copy = { ...item };
      if (tableName === "appointments") {
        if (selectFields.includes("clients")) {
          const client = (store.clients || []).find((c) => c.id === item.client_id);
          copy.clients = client ? { full_name: client.full_name, phone: client.phone } : null;
        }
        if (selectFields.includes("services")) {
          const service = (store.services || []).find((s) => s.id === item.service_id);
          copy.services = service
            ? { name: service.name, price: service.price, duration_minutes: service.duration_minutes }
            : null;
        }
        if (selectFields.includes("barber_staff") || selectFields.includes("staff")) {
          const staffMember = (store.barber_staff || []).find((st) => st.id === item.staff_id);
          copy.barber_staff = staffMember
            ? { id: staffMember.id, name: staffMember.name, role: staffMember.role, avatar_color: staffMember.avatar_color }
            : null;
        }
      }
      return copy;
    });

    if (isSingle) {
      const singleItem = processedItems.length > 0 ? processedItems[0] : null;
      return { data: singleItem, error: singleItem ? null : { message: "Registro no encontrado" } };
    }

    return { data: processedItems, error: null };
  }

  return builder;
}

const mockAuth = {
  async signUp({ email, password }) {
    const store = getStore();
    let user = (store.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        email,
      };
      if (!store.users) store.users = [];
      store.users.push(user);
    }
    store.currentUser = user;
    saveStore();
    return { data: { user }, error: null };
  },
  async signInWithPassword({ email, password }) {
    const store = getStore();
    let user = (store.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Check if it's the demo email or general login
      if (email.toLowerCase().includes("demo") || (store.users && store.users.length > 0 && email.toLowerCase() === store.users[0].email.toLowerCase())) {
        user = store.users[0];
      } else {
        user = { id: `user-${Date.now().toString(36)}`, email };
        if (!store.users) store.users = [];
        store.users.push(user);
      }
    }
    store.currentUser = user;
    saveStore();
    return { data: { user }, error: null };
  },
  async signInDemo() {
    const store = getStore();
    const demoUser = (store.users && store.users[0]) || { id: "barber-demo-1", email: "demo@barberia.es" };
    store.currentUser = demoUser;
    saveStore();
    return { data: { user: demoUser }, error: null };
  },
  async getUser() {
    const store = getStore();
    if (store.currentUser === null) {
      return { data: { user: null }, error: null };
    }
    let user = store.currentUser;
    if (user === undefined) {
      user = (store.users && store.users[0]) || { id: "barber-demo-1", email: "demo@barberia.es" };
      store.currentUser = user;
      saveStore();
    }
    return { data: { user }, error: null };
  },
  async signOut() {
    const store = getStore();
    store.currentUser = null;
    saveStore();
    return { error: null };
  },
};

const mockClient = {
  auth: mockAuth,
  from: (tableName) => createMockQueryBuilder(tableName),
};

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : mockClient;
