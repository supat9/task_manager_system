<template>  
  <q-page padding>
    <q-card class="q-pa-md">
      <q-card-section>
        <h1 class="text-h5">Task Manager</h1>
      </q-card-section>
      <q-card-section>
        <q-form @submit.prevent="handleSubmit">
          <q-input v-model="task.id" label="ID" outlined disable />
          <q-input v-model="task.title" label="Title" outlined required @blur="validateInput" />
          <q-input v-model="task.description" label="Description" outlined @blur="validateInput" />
          <q-select v-model="task.status" :options="statusOptions" label="Status" outlined />
          <q-input v-model="task.due_date" type="datetime-local" label="Due Date" outlined  />
          <div class="q-mt-md">
            <q-btn type="submit" color="primary">{{ isEditing ? 'Update' : 'Add' }} Task</q-btn>
            <q-btn v-if="isEditing" color="grey" class="q-ml-sm" @click="resetForm">ย้อนกลับ</q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-table 
      class="q-mt-md"
      :rows="tasks" 
      :columns="columns" 
      row-key="id" 
      bordered 
      separator="cell"
    >
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn color="warning" label="Edit" @click="editTask(props.row)" dense />
          <q-btn color="negative" label="Delete" @click="deleteTask(props.row.id)" dense class="q-ml-sm" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="showPopup">
      <q-card>
        <q-card-section>
          <div class="text-h6 text-black">{{ popupMessage }}</div>
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
    popupMessage.value = "ไม่สามารถใช้ภาษาไทยได้";
    showPopup.value = true;
  }
};

const fetchTasks = async () => {
  const response = await fetch('http://localhost:8900/tasks');
  tasks.value = await response.json();
};

const handleSubmit = async () => {
  if (!task.value.title || !task.value.description || !task.value.status || !task.value.due_date) {
    popupMessage.value = "กรุณากรอกให้ครบทุกช่อง";
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
  const response = await fetch(url, options);
  const data = await response.json();

  popupMessage.value = isEditing.value ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ";
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
  popupMessage.value = "ลบสำเร็จ";
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
