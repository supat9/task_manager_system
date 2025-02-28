<template>  
  <q-page padding>
    <q-card class="q-pa-md shadow-2">
      <q-card-section class="bg-primary text-white">
        <h1 class="text-h5">📋 Task Manager</h1>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleSubmit">
          <q-input v-model="task.id" label="🆔 ID" outlined disable class="q-mb-md" />
          <q-input v-model="task.title" label="📌 Title" outlined required @blur="validateInput" class="q-mb-md" />
          <q-input v-model="task.description" label="📝 Description" outlined @blur="validateInput" class="q-mb-md" />
          <q-select v-model="task.status" :options="statusOptions" label="📊 Status" outlined class="q-mb-md" />
          <q-input v-model="task.due_date" type="datetime-local" label="⏳ Due Date" outlined class="q-mb-md" />
          <div class="q-mt-md flex justify-between">
            <q-btn type="submit" color="primary" icon="save">{{ isEditing ? 'Update' : 'Add' }} Task</q-btn>
            <q-btn v-if="isEditing" color="grey" class="q-ml-sm" icon="arrow_back" @click="resetForm">Back</q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-table 
      class="q-mt-md shadow-2"
      :rows="tasks" 
      :columns="columns" 
      row-key="id" 
      bordered 
      separator="cell"
      dense
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn color="warning" label="Edit" icon="edit" @click="editTask(props.row)" dense />
          <q-btn color="negative" label="Delete" icon="delete" @click="deleteTask(props.row.id)" dense class="q-ml-sm" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showPopup">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-black text-center">{{ popupMessage }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const tasks = ref([]);
const task = ref({ id: '', title: '', description: '', status: 'Pending', due_date: '' });
const isEditing = ref(false);
let editId = null;
const showPopup = ref(false);
const popupMessage = ref("");

const statusOptions = ["Pending", "In Progress", "Completed"];

const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left' },
  { name: 'title', label: 'Title', field: 'title', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', align: 'left' },
  { name: 'due_date', label: 'Due Date', field: 'due_date', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
];

const validateInput = () => {
  const thaiRegex = /[\u0E00-\u0E7F]/;
  if (thaiRegex.test(task.value.title) || thaiRegex.test(task.value.description)) {
    popupMessage.value = "❌ ไม่สามารถใช้ภาษาไทยได้";
    showPopup.value = true;
  }
};

const fetchTasks = async () => {
  const response = await fetch('http://localhost:8900/tasks');
  tasks.value = await response.json();
};

const handleSubmit = async () => {
  if (!task.value.title || !task.value.description || !task.value.status || !task.value.due_date) {
    popupMessage.value = "⚠️ Please fill in all fields.";
    showPopup.value = true;
    return;
  }

  const updatedTask = {
    title: task.value.title,
    description: task.value.description,
    status: task.value.status,
    due_date: formatDateForInput(task.value.due_date)
  };
  
  const options = {
    method: isEditing.value ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask)
  };
  const url = isEditing.value ? `http://localhost:8900/tasks/${editId}` : 'http://localhost:8900/tasks';
  await fetch(url, options);
  popupMessage.value = isEditing.value ? "✅ Edited successfully" : "✅ Added successfully";
  showPopup.value = true;
  resetForm();
  fetchTasks();
};

const editTask = (t) => {
  task.value = { 
    id: t.id,
    title: t.title, 
    description: t.description, 
    status: t.status, 
    due_date: formatDateForInput(t.due_date) 
  };
  editId = t.id;
  isEditing.value = true;
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  return dateString.split(".")[0]; 
};

const deleteTask = async (id) => {
  await fetch(`http://localhost:8900/tasks/${id}`, { method: 'DELETE' });
  popupMessage.value = "🗑️ Delete successfully";
  showPopup.value = true;
  fetchTasks();
};

const resetForm = () => {
  task.value = { id: '', title: '', description: '', status: 'Pending', due_date: '' };
  isEditing.value = false;
  editId = null;
};

onMounted(fetchTasks);
</script>