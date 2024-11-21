// Переменные отвечающие за перетаскивание элементов
const taskLists = document.querySelectorAll('.task-list')
const backlogTasks = document.querySelector('#backlog .task-list')
const doingTasks = document.querySelector('#doing .task-list')
const doneTasks = document.querySelector('#done .task-list')
const discardTasks = document.querySelector('#discard .task-list')

// Переменные для модалки создания задачи
const addTaskBtn = document.querySelector('.header__button--new-task')
const closeModalAddTaskBtn = document.querySelector('.add-task-modal__close')
const addTaskModal = document.querySelector('.add-task-modal')

// Переменные для создания новой задачи
const newTaskTitle = document.querySelector('#title')
const newTaskDescription = document.querySelector('#description')
const newTaskDate = document.querySelector('#date')

const createTaskBtn = document.querySelector('#create-task')

// Переменные для фильтрации
const filterBtn = document.querySelector('.subheader__info-filter')
const filterBtnClose = document.querySelector('.filter-modal__close')
const filterModal = document.querySelector('.filter-modal')


// Переменные для  блока уведомлений и входящий
const inboxBtn = document.querySelector('.header__item--inbox')
const subheader = document.querySelector('.subheader')
const inbox = document.querySelector('.inbox')
const notificationBtn = document.querySelector('.header__item--notification')
const notification = document.querySelector('.notification')

const currentUser = JSON.parse(localStorage.getItem('currentUser')) || []

let currentActiveProjectId = null;

if (currentUser.role !== 'admin') {
  addTaskBtn.classList.add('none')
}

addTaskBtn.addEventListener('click', newTask)
closeModalAddTaskBtn.addEventListener('click', closeModalAddTask)

filterBtn.addEventListener('click', openModalFilter)
filterBtnClose.addEventListener('click', closeModalFilter)

// Функция загрузки всех проектов из localStorage
function loadProjects() {
  // console.log('Текущий активный проект ID:', currentActiveProjectId);

  const projects = JSON.parse(localStorage.getItem('projects')) || [];  // Загружаем проекты или пустой массив

  // Находим контейнер для проектов
  const projectsList = document.getElementById('projects-list');
  const projectTitle = document.querySelector('.subheader__info-project-name')
  projectsList.innerHTML = '';  // Очищаем контейнер (если есть старые проекты)

  // Если в localStorage есть проекты, отображаем их
  projects.forEach((project, index) => {    
    const projectElement = document.createElement('div');
    // const projectNameSubHeader = document.querySelector('.subheader__info-project-name')
    projectElement.classList.add('aside__project');
    projectElement.textContent = project.name; // Отображаем имя проекта
    projectElement.setAttribute('data-id', project.id); // Добавляем data-id для уникальности
    
    if (project.id == localStorage.getItem('currentActiveProject')) {
      projectTitle.textContent = project.name
      projectElement.classList.add('active');
      currentActiveProjectId = localStorage.getItem('currentActiveProject'); // Устанавливаем ID первого проекта как активный
    }

    projectsList.appendChild(projectElement);
  });

}

function addNewProject() {
  const newProjectName = prompt('Введите название нового проекта:');

  if (newProjectName && newProjectName.trim() !== '') {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];

    const newProjectId = projects.length;

    const newProject = {
      id: newProjectId,
      name: newProjectName
    };

    projects.push(newProject);

    // Сохраняем обновленный список проектов в localStorage
    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('currentActiveProject', newProjectId)

    // Обновляем отображение проектов
    loadProjects();
  }
}

// Функция для переключения активного проекта
function setActiveProject(event) {
  const projectTitle = document.querySelector('.subheader__info-project-name')
  const projects = JSON.parse(localStorage.getItem('projects')) || [];

  if (event.target.classList.contains('aside__project')) {    
    const clickedProjectId = parseInt(event.target.getAttribute('data-id'))
    
    if (currentActiveProjectId === clickedProjectId) {
      return;
    }
    inbox.style.display = 'none';
    notification.style.display = 'none'
    inboxBtn.classList.remove('active')
    notificationBtn.classList.remove('active')
    subheader.style.display = 'block'

    const currentActiveElement = document.querySelector(`.aside__project[data-id="${currentActiveProjectId}"]`);
    if (currentActiveElement) {
      currentActiveElement.classList.remove('active');
    }

    event.target.classList.add('active');
    // console.log(currentActiveProjectId);
    currentActiveProjectId = clickedProjectId;
    localStorage.setItem('currentActiveProject', currentActiveProjectId)
    projectTitle.textContent = projects[currentActiveProjectId].name
    const allTask = document.querySelectorAll('.task-container')


    allTask.forEach((task)=>{
      const taskProjectId = parseInt(task.getAttribute('data-task-project-id'))
      taskProjectId !== currentActiveProjectId ? task.style.display = 'none' : task.style.display = 'flex'
    })    
  }
}

// Инициализация, загрузка проектов и добавление обработчика на кнопку
document.addEventListener('DOMContentLoaded', function() {
  loadProjects(); // Загружаем проекты при загрузке страницы
  const newProjectBtn = document.getElementById('new-project-btn');
  newProjectBtn.addEventListener('click', addNewProject); // Обработчик для кнопки "Новый проект +"

  // Обработчик кликов на проекты, чтобы менять активность
  const projectsList = document.getElementById('projects-list');
  projectsList.addEventListener('click', setActiveProject);
});



const comments = JSON.parse(localStorage.getItem('comments')) || []

const currentTasks = JSON.parse(localStorage.getItem('tasks')) || []

taskLists.forEach((taskList) => {
  taskList.addEventListener('dragover', dragOver)
  taskList.addEventListener('drop', dragDrop)
})

function createTask(taskId, title, description, state, date, executor, projectId) {
  const taskCard = `
        <div class="task-container task-container--${state}" draggable="true" data-task-id="${taskId}" data-task-state="${state}" data-task-date="${date}" data-task-project-id="${projectId}">
          <div class="task-decor"></div>
          <div class="task-header__wrapper">
            <div class="task-header">${title}</div>
            <div class="task-details">
              <img src="./img/task-detail.svg" alt="" />
            </div>
          </div>
          <div class="task-footer">
            <div class="task-date">до ${date}</div>
            <div class="task-comment">
              <img src="./img/task-comment.svg" alt="" />
              <span class="task-comment-count"></span>
            </div>
          </div>
        </div> 
      `

  let taskCardDrag
  if (state === 'backlog') {
    backlogTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--backlog')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#FF5959'
  }
  if (state === 'doing') {
    doingTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--doing')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#597EFF'
  }
  if (state === 'done') {
    doneTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--done')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#59FFCD'
  }
  if (state === 'discard') {
    discardTasks.insertAdjacentHTML('afterbegin', taskCard)
    taskCardDrag = document.querySelector('.task-container--discard')
    taskCardDrag.querySelector('.task-decor').style.backgroundColor = '#FF59EE'
  }

  taskCardDrag.addEventListener('dragstart', dragStart)

  projectId != localStorage.getItem('currentActiveProject') ? taskCardDrag.style.display = 'none' : taskCardDrag.style.display = 'flex'
  
  let commentCount = 0
  if (comments) {    
    comments.forEach((comment)=> {
      if(comment.taskId === taskId) {
        commentCount++
      }
    })
  }
  taskCardDrag.querySelector('.task-comment-count').textContent = commentCount  
}

function addColor(column) {
  let color
  switch (column) {
    case 'backlog':
      color = '#FF5959'
      break
    case 'doing':
      color = '#597EFF'
      break
    case 'done':
      color = '#59FFCD'
      break
    case 'discard':
      color = '#FF59EE'
      break
    default:
      color = '#FF5959'
  }
  return color
}

function addTasks() {
  currentTasks.forEach((task) =>
    
    createTask(
      task.id,
      task.title,
      task.description,
      task.state,
      task.date,
      task.executor,
      task.projectId
    )
  )
}

addTasks()

let elementBeingDragged

function dragStart() {
  elementBeingDragged = this
}

function dragOver(e) {
  e.preventDefault()
}

function dragDrop() {
  const columnId = this.parentNode.id
  let decor = elementBeingDragged.querySelector('.task-decor')
  decor.style.backgroundColor = addColor(columnId)
  elementBeingDragged.setAttribute('data-task-state', columnId)
  this.append(elementBeingDragged)
  let taskId = elementBeingDragged.getAttribute('data-task-id')

  currentTasks.forEach((task) => {
    if (task.id === +taskId) {
      task.state = columnId
    }
  })

  localStorage.setItem('tasks', JSON.stringify(currentTasks))
}

// Функция для заполнения списка исполнителей
function populateExecutors() {
  const executorSelect = document.getElementById('executor')
  executorSelect.innerHTML = '' // Очищаем текущие options

  // Получаем пользователей из local storage
  const users = JSON.parse(localStorage.getItem('users')) || []

  // Добавляем пользователей в select
  users.forEach((user) => {
    const option = document.createElement('option')
    option.value = user.fullName // Сохраняем полное имя в value
    option.textContent = user.fullName // Отображаем полное имя
    executorSelect.appendChild(option)
  })
}

// Вызываем функцию при загрузке страницы
window.onload = populateExecutors

function addTask(e) {
  const executorSelect = document.getElementById('executor')
  const selectedExecutor = executorSelect.value
  e.preventDefault()
  const filteredTitles = currentTasks.filter((task) => {
    return task.title === newTaskTitle.value
  })

  if (!filteredTitles.length) {
    
    const newId = generateUniqueId()
    currentTasks.push({
      id: newId,
      title: newTaskTitle.value,
      description: newTaskDescription.value,
      date: newTaskDate.value,
      state: 'backlog',
      executor: selectedExecutor,
      projectId: currentActiveProjectId
    })
    localStorage.setItem('tasks', JSON.stringify(currentTasks))
    createTask(
      newId,
      newTaskTitle.value,
      newTaskDescription.value,
      (state = 'backlog'),
      newTaskDate.value,
      selectedExecutor,
      currentActiveProjectId
    )
    addTaskModal.classList.remove('open')
    newTaskTitle.value = ''
    newTaskDescription.value = ''
    newTaskDate.value = ''
    location.reload()
  } else {
    showError('Title must be unique!')
  }
}
createTaskBtn.addEventListener('click', addTask)

// Добавление новой задачи

function newTask() {
  addTaskModal.classList.add('open')
}

function closeModalAddTask() {
  addTaskModal.classList.remove('open')
}

// модалка фильтра
function openModalFilter() {
  filterModal.classList.add('open')
}

function closeModalFilter() {
  filterModal.classList.remove('open')
}

// Фильтрация задач

const searchInputFilter = document.getElementById('searchInputFilter')
const checkboxes = document.querySelectorAll('input[type="checkbox"]')
const cards = document.querySelectorAll('.task-container')
const resetBtnFilter = document.querySelector('.subheader__info-filter--reset')

function filterTask() {
  const searchTerm = searchInputFilter.value.toLowerCase()
  const currentDate = new Date()
  const currentProjectId = localStorage.getItem('currentActiveProject')
  const selectedFilters = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value)

  cards.forEach((card) => {    
    if(card.getAttribute('data-task-project-id') == currentProjectId) {

      const dueDate = new Date(card.getAttribute('data-task-date'))
      const cardText = card.textContent.toLowerCase()
      // Проверяем соответствие поисковому запросу
      const matchesSearch = cardText.includes(searchTerm)
      // Проверяем фильтр по дате
      const matchesFilter = selectedFilters.some((filter) => {
        if (filter === 'overdue') {
          return dueDate < currentDate
        } else if (filter === 'dueSoon') {        
          const oneDayFromNow = new Date(currentDate)
          oneDayFromNow.setDate(currentDate.getDate() + 1)
          return dueDate >= currentDate && dueDate < oneDayFromNow
        } else if (filter === 'dueWeek') {
          const oneWeekFromNow = new Date(currentDate)
          oneWeekFromNow.setDate(currentDate.getDate() + 7)
          return dueDate >= currentDate && dueDate < oneWeekFromNow
        }
        return false
      })
  
      // Показываем или скрываем карточку
      if (matchesSearch && (selectedFilters.length === 0 || matchesFilter)) {
        card.style.display = 'flex'
      } else {
        card.style.display = 'none'
      }
    }
  })
}

function resetFilters() {
  searchInputFilter.value = ''
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false
  })
  filterTask() // Применяем сброс
}

searchInputFilter.addEventListener('input', filterTask)
checkboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', filterTask)
})

resetBtnFilter.addEventListener('click', resetFilters)

// Разлогин

const logoutBtn = document.querySelector('.header__user-logout')
logoutBtn.addEventListener('click', logout)

function logout() {
  localStorage.removeItem('currentUser')
  window.location.href = 'index.html'
}

// Модальное окно просмотра задачи

const modalTask = document.querySelector('.task-modal')
const closeBtnTaskModal = document.querySelector('.task-modal__close')
const taskModalTitle = document.querySelector('.task-modal__title')
const taskModalDescription = document.querySelector('.task-modal__description')
const taskModalDate = document.querySelector('.taskmodal-date-value')
const taskModalExecutor = document.querySelector('.task-modal__executor')
const taskModalExecutorSelect = document.querySelector(
  '.task-modal__input-executor'
)
const taskModalDecor = document.querySelector('.task-modal__decor')
const taskModalBtnDeleteTask = document.querySelector(
  '.task-modal__delete-task-btn'
)

if (currentUser.role !== 'admin') {
  taskModalExecutorSelect.classList.add('none')
}

let currentTaskId = null

function populateExecutorSelect() {
  const users = JSON.parse(localStorage.getItem('users')) || []
  taskModalExecutorSelect.innerHTML = '' // Очищаем текущие options

  users.forEach((user) => {
    const option = document.createElement('option')
    option.value = user.fullName // Или user.fullName, в зависимости от вашего выбора
    option.textContent = user.fullName // Отображаем полное имя
    taskModalExecutorSelect.appendChild(option)
  })
}

function openModal(task) {
  modalTask.classList.add('open')
  taskModalTitle.textContent = task.title
  taskModalDescription.textContent = task.description || null
  taskModalDate.textContent = task.date
  taskModalExecutor.textContent = task.executor
  currentTaskId = task.id

  // Устанавливаем выбранного исполнителя в select
  if (currentUser.role === 'admin') {
    taskModalExecutorSelect.value = task.executor // Устанавливаем текущее значение исполнителя
    populateExecutorSelect() // Заполняем список пользователей
  } else {
    taskModalExecutorSelect.classList.add('none') // Скрываем select для не-администраторов
  }

  taskModalDecor.className = 'task-modal__decor' // Сброс стилей
  taskModalDecor.classList.add(`task-modal__decor--${task.state}`)

  loadComments() // Загружаем комментарии
}

function saveChanges() {
  const tasks = JSON.parse(localStorage.getItem('tasks'))
  const taskIndex = tasks.findIndex((task) => task.id === currentTaskId)

  if (taskIndex !== -1) {
    tasks[taskIndex].executor = taskModalExecutorSelect.value // Обновляем исполнителя
    localStorage.setItem('tasks', JSON.stringify(tasks)) // Сохраняем обновленный массив
    closeTaskModal() // Закрываем модальное окно
    location.reload() // Перезагрузите страницу, чтобы отобразить изменения
  }
}

const taskContainers = document.querySelectorAll('.task-container')

taskContainers.forEach((container) => {
  container.addEventListener('click', function () {
    const taskId = this.getAttribute('data-task-id')
    const task = JSON.parse(localStorage.getItem('tasks')).find(
      (t) => t.id == taskId
    )
    if (task) {
      openModal(task)
    }
  })
})

function deleteTask() {
  const tasks = JSON.parse(localStorage.getItem('tasks'))
  const updatedTasks = tasks.filter((task) => task.id !== currentTaskId) // Удаляем задачу по ID
  localStorage.setItem('tasks', JSON.stringify(updatedTasks)) // Обновляем localStorage
  closeTaskModal() // Закрываем модальное окно
  location.reload() // Перезагружаем страницу, чтобы отобразить изменения (или обновить задачи)
}

function closeTaskModal() {
  modalTask.classList.remove('open')
}

taskModalBtnDeleteTask.addEventListener('click', deleteTask)
taskModalExecutorSelect.addEventListener('change', saveChanges)
closeBtnTaskModal.addEventListener('click', closeTaskModal)

// Добавление комментария

if (!localStorage.getItem('comments')) {
  localStorage.setItem('comments', JSON.stringify([]))
}

const taskModalComments = document.querySelector('.task-modal__comments')
const commentInput = document.querySelector('.task-modal__input')

function saveComment() {
  const text = commentInput.value.trim()
  if (text) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    const comments = JSON.parse(localStorage.getItem('comments')) || []
    const timestamp = new Date().toLocaleString() // Получаем текущую дату и время

    comments.push({
      taskId: currentTaskId,
      text,
      userName: currentUser.fullName, // Имя пользователя
      date: timestamp, // Дата и время
    })

    localStorage.setItem('comments', JSON.stringify(comments))
    commentInput.value = '' // Очищаем поле ввода
    loadComments() // Перезагружаем комментарии
    window.location.reload()
  }
}

function loadComments() {
  const comments = JSON.parse(localStorage.getItem('comments')) || []
  const taskComments = comments.filter(
    (comment) => comment.taskId === currentTaskId
  )

  taskModalComments.innerHTML = '' // Очищаем текущие комментарии

  taskComments.forEach((comment) => {
    const commentElement = document.createElement('div')
    commentElement.className = 'task-modal__comments-item'
    commentElement.innerHTML = `<div class="task-modal__comments-header">
            <div class="task-modal__comments-username">${comment.userName}</div>
            <div class="task-modal__comments-date">${comment.date}</div>
          </div>
          <div class="task-modal__comments-text">${comment.text}</div>`
    taskModalComments.appendChild(commentElement)
  })
}

commentInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    saveComment()
  }
})


// Показ блока входящие

inboxBtn.addEventListener('click', closeInbox)
notificationBtn.addEventListener('click', closeNotification)

function closeInbox(e) {
  e.preventDefault()
  notificationBtn.classList.remove('active')
  notification.style.display = 'none'
  subheader.style.display = 'none'
  inbox.style.display = 'block'
  inboxBtn.classList.add('active')
}


function closeNotification(e) {
  e.preventDefault()
  inboxBtn.classList.remove('active')
  inbox.style.display = 'none'
  subheader.style.display = 'none'
  notification.style.display = 'block'
  notificationBtn.classList.add('active')
}

// Удаление проекта

const deleteProjectBtn = document.querySelector('.subheader__actions-share')
deleteProjectBtn.addEventListener('click', ()=> {

  let currentActiveProjectId = localStorage.getItem('currentActiveProject')
  let projectsData = JSON.parse(localStorage.getItem('projects')) || [];

  if (currentUser.role !== 'admin') {
    deleteProjectBtn.classList.add('none')
  }

  let includesTaskIds = []
  let tasks = JSON.parse(localStorage.getItem('tasks')) || []

  tasks.forEach((task) => {    
    if(task.projectId == currentActiveProjectId && !includesTaskIds.includes(task.id)) {
      includesTaskIds.push(task.id)
    }
  })
  const filterTask = tasks.filter(item => !includesTaskIds.includes(item.id));
  localStorage.setItem('tasks',  JSON.stringify(filterTask))



  const filterProject = projectsData.filter(item => item.id != currentActiveProjectId)
  localStorage.setItem('projects',  JSON.stringify(filterProject))  
  window.location.reload()

  // 
})


function generateUniqueId() {
  return Date.now() + '_' + Math.floor(Math.random() * 10000);
}
