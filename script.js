//---Draggable Car---

const slider = document.getElementById('slider-car');
const root = document.documentElement;

slider.oninput = () => {
  const maxScroll = root.scrollHeight - window.innerHeight*0.99;
  const scrollTarget = (slider.value / 100) * maxScroll;
  window.scrollTo(0, scrollTarget);
};

window.onscroll = () => {
  const maxScroll = root.scrollHeight - window.innerHeight*0.99;
  const percentage = (window.scrollY / maxScroll) * 100;
  slider.value = percentage;
  root.style.setProperty('--scroll-pos', percentage / 100);
};

//---Statistics---
const yearSelect = document.getElementById("yearSelect");
const CarContainer = document.getElementById("carType");
const tableBody = document.getElementById("raceData");
const driverContainer = document.getElementById("DriversPic");

if (yearSelect && CarContainer && tableBody && driverContainer) {

  let raceResults = {}

  async function uploadData() {
    const response = await fetch('raceData.json');

    raceResults = await response.json();

    updateContent("2025");
  }

  function updateContent(year) {
    const data = raceResults[year];

    //Cars
    while (CarContainer.firstChild) {
      CarContainer.removeChild(CarContainer.firstChild);
    }

    if (data && data.Car) {
      data.Car.forEach((item) => {

        const divWrap = document.createElement("div")

        const aWrap = document.createElement("a")
        aWrap.href = `cars.html#${item.name}`;

        const tileWrap = document.createElement("div")
        tileWrap.classList.add("stats-car--tile")

        const image = document.createElement("img");
        image.src = `/Images/Cars/${item.img}`;
        image.alt = item.name;

        const caption = document.createElement("figcaption");
        caption.textContent = item.name;

        tileWrap.appendChild(image);
        aWrap.appendChild(tileWrap);
        aWrap.appendChild(caption);
        divWrap.appendChild(aWrap);

        CarContainer.appendChild(divWrap)
      });
    }

    //Drivers
    while (driverContainer.firstChild) {
      driverContainer.removeChild(driverContainer.firstChild);
    }

    if (data && data.drivers) {
      data.drivers.forEach((item) => {

        const divWrap = document.createElement("div")

        const aWrap = document.createElement("a")
        aWrap.href = `drivers.html#${item.id}`;

        const tileWrap = document.createElement("div")
        tileWrap.classList.add("driver-tile")

        const image = document.createElement("img");
        image.src = `/Images/Drivers/${item.img}`;
        image.alt = item.name;

        const caption = document.createElement("figcaption");
        caption.textContent = item.name;

        tileWrap.appendChild(image);
        aWrap.appendChild(tileWrap);
        aWrap.appendChild(caption);
        divWrap.appendChild(aWrap);

        driverContainer.appendChild(divWrap)
      });
    }

    //Races
    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }

    if (data?.races?.length > 0) {
      
      const headerRow = document.createElement("tr");
      const thDriver = document.createElement("th");
      thDriver.textContent = "Drivers";
      headerRow.appendChild(thDriver);

      data.races[0].results.forEach((res) => {
        const th = document.createElement("th");
        th.textContent = res.GP || "";
        headerRow.appendChild(th);
      });
      tableBody.appendChild(headerRow);

      data.races.forEach((item) => {
        const rowPlace = document.createElement("tr");
        const rowTime = document.createElement("tr");

        const tdName = document.createElement("td");
        tdName.rowSpan = 2;
        tdName.textContent = item.Drivers;
        rowPlace.appendChild(tdName);

        item.results.forEach((res) => {
          const tdPlace = document.createElement("td");
          tdPlace.textContent = res.Place || "-";
          rowPlace.appendChild(tdPlace);

          const tdTime = document.createElement("td");
          tdTime.textContent = res.Time || "-";
          rowTime.appendChild(tdTime);
        });

        tableBody.appendChild(rowPlace);
        tableBody.appendChild(rowTime);
      });
    }
  }

  yearSelect.addEventListener("change", (event) =>
    updateContent(event.target.value),
  );

  updateContent(yearSelect.value);
  uploadData();
}

//---About---
  //Classes
  class Person {
    #firstName;
    #lastName;

    constructor({firstName, lastName}) {
      this.#firstName = firstName;
      this.#lastName = lastName;
    }
    
    get firstName() { return this.#firstName.charAt(0).toUpperCase() + this.#firstName.slice(1).toLowerCase(); }
    set firstName(value) { 
      if (typeof value !== 'string') {
        throw new Error('First name must be a string');
      }
      this.#firstName = value;
    }

    get lastName() { return this.#lastName.charAt(0).toUpperCase() + this.#lastName.slice(1).toLowerCase(); }
    set lastName(value) { 
      if (typeof value !== 'string') {
        throw new Error('Last name must be a string');
      }
      this.#lastName = value;
    }
  }
  class Course {
    #title;
    #teacher;
    #description;

    constructor({title, teacher, description}) {
      this.#title = title;
      this.#teacher = teacher;
      this.#description = description;
    }

    get title() { return this.#title.charAt(0).toUpperCase() + this.#title.slice(1).toLowerCase(); }
    set title(value) { 
      if (typeof value !== 'string') {
        throw new Error('Title must be a string');
      }
      this.#title = value; 
    }

    get teacher() { 
      if (typeof this.#teacher === 'object' && this.#teacher.firstName) {
        const fullName = `${this.#teacher.firstName} ${this.#teacher.lastName}`;
        return fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
      }
    }
    set teacher(value) { 
      if (typeof value !== 'object') {
        throw new Error('Teacher must be a object');
      }
      this.#teacher = value; 
    }

    get description() { return this.#description; }
    set description(value) { 
      if (typeof value !== 'string') {
        throw new Error('Description must be a string');
      }
      this.#description = value; 
    }
  }
  class Student extends Person {
    #age;
    #hobbies;
    #email;
    #photo;
    #major;
    #courses;

    constructor({ firstName, lastName, age, hobbies = [], email, photo, major, courses = [] }) {
      super({ firstName, lastName });
      
      this.#age = age;
      this.#hobbies = hobbies;
      this.#email = email;
      this.#photo = photo;
      this.#major = major;
      this.#courses = courses.map(c => new Course(c));
    }

    get firstName() { return super.firstName.charAt(0).toUpperCase() + super.firstName.slice(1).toLowerCase(); }
    set firstName(value) { 
      if (typeof value !== 'string') {
        throw new Error('First name must be a string');
      }
      super.firstName = value;
    }

    get lastName() { return super.lastName.charAt(0).toUpperCase() + super.lastName.slice(1).toLowerCase(); }
    set lastName(value) { 
      if (typeof value !== 'string') {
        throw new Error('Last name must be a string');
      }
      super.lastName = value;
    }

    get age() { return this.#age; }
    set age(value) { 
      if (typeof value !== 'number') {
        throw new Error('age must be a number');
      }
      this.#age = value;
    }

    get hobbies() { return this.#hobbies; }
    set hobbies(value) { 
      if (!Array.isArray(value)) {
        throw new Error('Hobbies must be a array');
      }
      this.#hobbies = value; 
    }

    get email() { return this.#email; }
    set email(value) { 
      if (typeof value !== 'string') {
        throw new Error('Email must be a string');
      }
      this.#email = value;
    }

    get photo() { return this.#photo; }
    set photo(value) {
      if (typeof value !== 'string') {
        throw new Error('Photo must be a string');
      }
      this.#photo = value; 
    }

    get major() { return this.#major.charAt(0).toUpperCase() + this.#major.slice(1).toLowerCase(); }
    set major(value) {
      if (typeof value !== 'string') {
        throw new Error('Major must be a string');
      }
      this.#major = value; 
    }

    get courses() { return this.#courses; }
    set courses(value) { 
      if (!Array.isArray(value)) {
        throw new Error('Courses must be a array');
      }
      this.#courses = value; 
    }

    //HTML-code
    render() {
      const section = document.createElement('section');
      section.classList.add('student-section');

      const tileDiv = document.createElement('div');
      tileDiv.classList.add('student-tile');

      const name = document.createElement('h2');
      const nameText = document.createTextNode(`${this.firstName} ${this.lastName}`);
      name.appendChild(nameText);
      
      const img = document.createElement('img');
      img.src = this.photo; 
      img.alt = `${this.firstName} ${this.lastName}`;

      tileDiv.appendChild(name)
      tileDiv.appendChild(img);

      const content = document.createElement('div');
      content.classList.add('student-content');

      const info = document.createElement('pre');
      const infoText = document.createTextNode(`Major: ${this.major}\nAge: ${this.age}\nHobbies: ${this.hobbies.join(', ')}`);
      info.appendChild(infoText);

      const mailContainer = document.createElement('p');
      mailContainer.textContent = 'Mail: ';

      const mailLink = document.createElement('a');
      mailLink.href = `mailto:${this.email}`;
      mailLink.textContent = this.email;
      mailContainer.appendChild(mailLink);

      const coursesTitle = document.createElement('h3');
      coursesTitle.textContent = 'Courses:';

      const coursesList = document.createElement('ul');

      this.courses.forEach(course => {
        const listItem = document.createElement('li');
        const listName = document.createElement('h5');
        listName.textContent = `${course.title} - ${course.teacher}`;
        const listDescription = document.createElement('div');
        listDescription.textContent = `${course.description}`;
        listDescription.style.fontSize = '0.8em';
        listItem.appendChild(listName);
        listItem.appendChild(listDescription);
        coursesList.appendChild(listItem);
      });

      content.appendChild(info);
      content.appendChild(mailContainer)

      content.appendChild(coursesTitle);
      content.appendChild(coursesList);

      section.appendChild(tileDiv);
      section.appendChild(content);

      return section;
    }
  }

  //File Reader
  const fileInput = document.getElementById('fileInput');
  const studentContainer = document.getElementById('studentContainer');

  fileInput.addEventListener('change', function(e) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
          try {
              const data = JSON.parse(event.target.result);
              
              while (studentContainer.firstChild) {
                  studentContainer.removeChild(studentContainer.firstChild);
              }
              
              data.forEach(studentData => {
                  const studentObj = new Student(studentData);
                  studentContainer.appendChild(studentObj.render());
              });

              const uploadArea = document.getElementById('uploadArea');
              if (uploadArea) {
                  uploadArea.style.display = 'none';
              }

          } catch (err) {
              alert("Error loading the JSON-file. Something went wrong loading the students: \n\n"+ err.message);
          }
      };

      const selectedFile = e.target.files[0];
      if (selectedFile) {
          reader.readAsText(selectedFile);
      }
  });