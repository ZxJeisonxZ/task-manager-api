let tasks = [];
let currentPage = 1;
let totalPages = 1;
let totalTasks = 0;
const ITEMS_PER_PAGE = 5;
let currentFilter = 'all';
let taskToDelete = null;
const API_BASE_URL = '/api/tasks/';

// Headers para las peticiones
function getHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken') || '',
    };
}

// Función para obtener cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Mostrar loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

// Mostrar mensajes
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container.mt-4');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        // Desaparecer automaticamente despues de 5 segundos
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'danger');
}

// Función para renderizar controles de paginación
function renderPagination() {
    // Eliminar paginación anterior si existe
    const oldPagination = document.getElementById('pagination-container');
    if (oldPagination) oldPagination.remove();
    
    if (totalPages <= 1) return; // No mostrar controles si hay una sola página
    
    const paginationHTML = `
        <div class="col-12 mt-4" id="pagination-container">
            <nav aria-label="Navegación de páginas">
                <ul class="pagination justify-content-center">
                    <!-- Botón Anterior -->
                    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                        <button class="page-link" onclick="changePage(${currentPage - 1})" 
                                ${currentPage === 1 ? 'disabled' : ''}>
                            &laquo; Anterior
                        </button>
                    </li>
                    
                    <!-- Números de página -->
                    ${generatePageNumbers()}
                    
                    <!-- Botón Siguiente -->
                    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                        <button class="page-link" onclick="changePage(${currentPage + 1})" 
                                ${currentPage === totalPages ? 'disabled' : ''}>
                            Siguiente &raquo;
                        </button>
                    </li>
                </ul>
                <p class="text-center text-muted small mt-2">
                    Página ${currentPage} de ${totalPages} • Mostrando ${tasks.length} de ${totalTasks} tareas
                </p>
            </nav>
        </div>
    `;
    
    // Insertar después del contenedor de tareas
    const tasksContainer = document.getElementById('tasks-container');
    tasksContainer.insertAdjacentHTML('afterend', paginationHTML);
}

// Función auxiliar para generar números de página
function generatePageNumbers() {
    let pagesHTML = '';
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Primera página
    if (startPage > 1) {
        pagesHTML += `
            <li class="page-item ${currentPage === 1 ? 'active' : ''}">
                <button class="page-link" onclick="changePage(1)">1</button>
            </li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }
    
    // Páginas visibles
    for (let i = startPage; i <= endPage; i++) {
        pagesHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${i})">${i}</button>
            </li>
        `;
    }
    
    // Última página
    if (endPage < totalPages) {
        pagesHTML += `
            ${endPage < totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item ${currentPage === totalPages ? 'active' : ''}">
                <button class="page-link" onclick="changePage(${totalPages})">${totalPages}</button>
            </li>
        `;
    }
    
    return pagesHTML;
}

// Cambiar de página
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    // Desplazar hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Cargar nueva página
    loadTasks(page);
}

// Cargar todas las tareas
async function loadTasks(page = 1) {
    try {
        showLoading(true);

        const response = await fetch(`${API_BASE_URL}?page=${page}`);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Si la API devuelve estructura paginada
        if (data.results) {
            tasks = data.results;
            totalTasks = data.count || 0;
            totalPages = data.total_pages || Math.ceil(totalTasks / ITEMS_PER_PAGE);
            currentPage = page;
        } else {
            // Si no hay paginación
            tasks = data;
            totalTasks = data.length;
            totalPages = 1;
        }
        
        renderTasks();
        renderPagination();
        
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        showError('No se pudieron cargar las tareas');
    } finally {
        showLoading(false);
    }
}

// Renderizar tareas
function renderTasks() {
    const container = document.getElementById('tasks-container');
    if (!container) return;
    
    if (!tasks || tasks.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info text-center">
                    <i class="bi bi-info-circle"></i> No hay tareas. ¡Crea una nueva!
                </div>
            </div>
        `;
        return;
    }
    
    // Filtrar tareas
    let filteredTasks = tasks;
    if (currentFilter !== 'all') {
        filteredTasks = tasks.filter(task => task.status === currentFilter);
    }
    
    // Generar cards para cada tarea
    const tasksHTML = filteredTasks.map(task => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card task-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0">${task.title}</h5>
                        <span class="badge ${task.status === 'completada' ? 'bg-success' : 'bg-warning'}">
                            ${task.status === 'completada' ? 'Completada' : 'Pendiente'}
                        </span>
                    </div>
                    
                    <p class="card-text text-muted">
                        ${task.description || 'Sin descripción'}
                    </p>
                    
                    <div class="text-muted small mb-3">
                        <i class="bi bi-calendar"></i> ${formatDate(task.created_at)}
                    </div>
                    
                    <div class="d-flex justify-content-end">
                        <!-- Cambiar estado - SOLO PARA PENDIENTES -->
                        ${task.status === 'pendiente' ? 
                            `<button class="btn btn-sm btn-outline-success me-2" 
                                    onclick="toggleTaskStatus(${task.id})" 
                                    title="Marcar como completada">
                                <i class="bi bi-check-circle"></i>
                            </button>` 
                            : ''}
                        
                        <button class="btn btn-sm btn-outline-primary me-2" 
                                onclick="editTask(${task.id})" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="confirmDelete(${task.id})" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = tasksHTML;
}

// Cambiar estado de una tarea (pendiente a completada)
async function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status !== 'pendiente') return;
    
    try {
        // Siempre cambia a completada
        const response = await fetch(`${API_BASE_URL}${taskId}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status: 'completada' })
        });
        
        if (!response.ok) {
            throw new Error('Error al cambiar el estado de la tarea');
        }
        
        await loadTasks(currentPage);
        showSuccess('Tarea marcada como completada');
        
    } catch (error) {
        showError('No se pudo completar la tarea');
    }
}

// Mostrar modal para crear tarea
function showCreateModal() {
    document.getElementById('modalTitle').textContent = 'Nueva Tarea';
    
    // Resetear formulario
    const form = document.getElementById('taskForm');
    if (form) form.reset();
    
    document.getElementById('taskId').value = '';
    document.getElementById('status').value = 'pendiente';
    
    // Resetear validación
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.classList.remove('is-invalid');
    
    // Mostrar modal
    const modalElement = document.getElementById('taskModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Guardar tarea (CREAR o ACTUALIZAR)
async function saveTask() {
    const taskId = document.getElementById('taskId')?.value || '';
    const titleInput = document.getElementById('title');
    const title = titleInput ? titleInput.value.trim() : '';
    const description = document.getElementById('description')?.value.trim() || '';
    const status = document.getElementById('status')?.value || 'pendiente';
    
    // Validar título
    if (!title) {
        if (titleInput) {
            titleInput.classList.add('is-invalid');
            titleInput.focus();
        }
        showError('El título es obligatorio');
        return false;
    }
    
    // Preparar datos para enviar
    const taskData = { 
        title: title, 
        description: description, 
        status: status 
    };
    
    // Determinar URL y método
    const url = taskId ? `${API_BASE_URL}${taskId}/` : API_BASE_URL;
    const method = taskId ? 'PUT' : 'POST';
    
    try {
        const saveButton = document.getElementById('saveTaskButton');
        if (saveButton) {
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Guardando...';
            saveButton.disabled = true;
        }
        
        // Enviar petición a la API
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = 'Error al guardar la tarea';
            
            if (errorData.title) {
                errorMessage = Array.isArray(errorData.title) ? errorData.title[0] : errorData.title;
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.non_field_errors) {
                errorMessage = errorData.non_field_errors[0];
            }
            
            throw new Error(errorMessage);
        }
        
        // Cerrar el modal
        const modalElement = document.getElementById('taskModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
        
        await loadTasks(currentPage);
        showSuccess(taskId ? 'Tarea actualizada correctamente' : 'Tarea creada correctamente');
        
        return true;
        
    } catch (error) {
        console.error('Error completo:', error);
        showError(error.message || 'Error al guardar la tarea');
        return false;
        
    } finally {
        // Restaurar el botón de guardar
        const saveButton = document.getElementById('saveTaskButton');
        if (saveButton) {
            saveButton.innerHTML = 'Guardar Tarea';
            saveButton.disabled = false;
        }
    }
}

// Mostrar modal para editar tarea
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTitle').textContent = 'Editar Tarea';
    document.getElementById('taskId').value = task.id;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    document.getElementById('status').value = task.status;
    
    // Resetear validación
    const titleInput = document.getElementById('title');
    if (titleInput) titleInput.classList.remove('is-invalid');
    
    // Mostrar modal
    const modalElement = document.getElementById('taskModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Confirmar eliminación
function confirmDelete(taskId) {
    taskToDelete = taskId;
    
    const task = tasks.find(t => t.id === taskId);
    const message = document.getElementById('confirmMessage');
    if (task && message) {
        message.textContent = `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`;
    }
    
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Eliminar tarea
async function deleteTask() {
    if (!taskToDelete) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}${taskToDelete}/`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al eliminar la tarea');
        }
        
        // Cerrar modal
        const modalElement = document.getElementById('confirmModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        }
        
        await loadTasks(currentPage);
        showSuccess('Tarea eliminada correctamente');
        
    } catch (error) {
        showError('No se pudo eliminar la tarea');
    } finally {
        taskToDelete = null;
    }
}

// Filtrar tareas
function filterTasks(status) {
    // Actualizar filtro
    currentFilter = status;
    
    // Actualizar botones
    document.querySelectorAll('#filter-buttons .btn-filter').forEach(btn => {
        btn.classList.remove('active', 'btn-warning', 'btn-success', 'btn-secondary');
        
        if (btn.getAttribute('data-filter') === status) {
            btn.classList.add('active');
            // Agregar color según el filtro
            if (status === 'pendiente') btn.classList.add('btn-warning');
            else if (status === 'completada') btn.classList.add('btn-success');
            else btn.classList.add('btn-secondary');
        } else {
            // Outline para los no activos
            btn.classList.add('btn-outline-' + 
                (btn.getAttribute('data-filter') === 'pendiente' ? 'warning' :
                 btn.getAttribute('data-filter') === 'completada' ? 'success' : 'secondary'));
        }
    });
    
    renderTasks();
}

// Buscar tareas
function searchTasks(query) {
    if (!query) {
        renderTasks();
        return;
    }
    
    const container = document.getElementById('tasks-container');
    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center">
                    <i class="bi bi-search"></i> No se encontraron tareas con ese criterio
                </div>
            </div>
        `;
        return;
    }
    
    const originalTasks = tasks;
    const originalFilter = currentFilter;
    
    tasks = filteredTasks;
    currentFilter = 'all';
    renderTasks();
    
    tasks = originalTasks;
    currentFilter = originalFilter;
}


// Inicializacion
document.addEventListener('DOMContentLoaded', function() {
    // Cargar tareas al inicio
    loadTasks();
    
    // Configurar botón de confirmación de eliminación
    const confirmBtn = document.getElementById('confirmButton');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', deleteTask);
    }
    
    // Resetear validación al escribir en el título
    const titleInput = document.getElementById('title');
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
    }
});
