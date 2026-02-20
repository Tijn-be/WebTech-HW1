//Table

import { raceResults } from "./data.js";

const yearSelect = document.getElementById("yearSelect");
const CarContainer = document.getElementById("carType");
const tableBody = document.getElementById("raceData");
const driverContainer = document.getElementById("DriversPic");
const driverListContainer = document.getElementsByClassName("driverList");
function updateContent(year) {
  const data = raceResults[year];

  CarContainer.innerHTML = "";
  if (data && data.Car) {
    data.Car.forEach((item) => {
      CarContainer.innerHTML += `<div>
      <a href="cars.html#${item.name}">
        <div class="car-tile">
            <img src="/Images/Cars/${item.img}" alt="${item.name}">
        </div>
        <figcaption>${item.name}</figcaption>
      </a>
      </div>`;
    });
  }

  driverContainer.innerHTML = "";
  if (data && data.drivers) {
    data.drivers.forEach((item) => {
      driverContainer.innerHTML += `<div>
        <a href="drivers.html#${item.id}">
            <div class="driver-tile">
              <img src="/Images/Drivers/${item.img}" alt="${item.name}">
            </div>
          <figcaption>${item.name}</figcaption>
        </a>
      </div>`;
    });
  }

  tableBody.innerHTML = "";
  if (data && data.races && data.races.length > 0) {
    let rij1 = `<tr><th>Drivers</th>`;

    data.races[0].results.forEach((res) => {
      rij1 += `<th>${res.GP || ""}</th>`;
    });

    rij1 += `</tr>`;

    tableBody.innerHTML = rij1;

    data.races.forEach((item) => {
      let rij2 = `<tr><td rowspan="2">${item.Drivers}</td>`;
      let rij3 = `<tr>`;

      item.results.forEach((res) => {
        rij2 += `<td>${res.Place || "-"}</td>`;
        rij3 += `<td>${res.Time || "-"}</td>`;
      });
      rij2 += `</tr>`;
      rij3 += `</tr>`;

      tableBody.innerHTML += rij2 + rij3;
    });
  }
}

yearSelect.addEventListener("change", (event) =>
  updateContent(event.target.value),
);

updateContent(yearSelect.value);
