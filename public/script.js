document.addEventListener('DOMContentLoaded', () => {
  const scheduleContainer = document.getElementById('schedule-container');
  const searchInput = document.getElementById('category-search');

  let talks = [];

  const fetchTalks = async () => {
    try {
      const response = await fetch('/api/talks');
      talks = await response.json();
      renderSchedule(talks);
    } catch (error) {
      console.error('Error fetching talks:', error);
      scheduleContainer.innerHTML = '<p>Error loading schedule. Please try again later.</p>';
    }
  };

  const renderSchedule = (filteredTalks) => {
    scheduleContainer.innerHTML = '';

    const scheduleItems = [
      ...filteredTalks,
      { title: 'Lunch Break', startTime: '13:20', duration: 60, isBreak: true },
    ];

    scheduleItems.sort((a, b) => a.startTime.localeCompare(b.startTime));

    let previousEndTime = '09:50';

    scheduleItems.forEach(item => {
      const startTime = item.startTime;
      const transitionDuration = 10;
      const breakDuration = 60;

      // Add transition time
      const previousEnd = new Date(`2025-01-01T${previousEndTime}:00`);
      const currentStart = new Date(`2025-01-01T${startTime}:00`);
      const diff = (currentStart - previousEnd) / (1000 * 60);

      if (diff > 0 && !item.isBreak) {
        const transitionDiv = document.createElement('div');
        transitionDiv.className = 'schedule-item break';
        transitionDiv.innerHTML = `<p>Transition (${diff} minutes)</p>`;
        scheduleContainer.appendChild(transitionDiv);
      }


      const talkDiv = document.createElement('div');
      talkDiv.className = 'schedule-item';

      if (item.isBreak) {
        talkDiv.classList.add('break');
        talkDiv.innerHTML = `<h2>${item.title}</h2><p class="time">${item.startTime} - 14:20</p>`;
      } else {
        const endTime = new Date(new Date(`2025-01-01T${item.startTime}:00`).getTime() + item.duration * 60000);
        const endTimeString = endTime.toTimeString().substring(0, 5);

        talkDiv.innerHTML = `
          <div class="time">${item.startTime} - ${endTimeString}</div>
          <h2>${item.title}</h2>
          <div class="speakers">By: ${item.speakers.join(', ')}</div>
          <div class="description">${item.description}</div>
          <div class="categories">
            ${item.category.map(cat => `<span class="category">${cat}</span>`).join('')}
          </div>
        `;
        previousEndTime = endTimeString;
      }
      scheduleContainer.appendChild(talkDiv);
    });
  };

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTalks = talks.filter(talk =>
      talk.category.some(cat => cat.toLowerCase().includes(searchTerm))
    );
    renderSchedule(filteredTalks);
  });

  fetchTalks();
});