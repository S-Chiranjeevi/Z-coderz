function analyze() {
  const hb = parseFloat(document.getElementById("hb").value);
  const wbc = parseFloat(document.getElementById("wbc").value);
  const plate = parseFloat(document.getElementById("platelets").value);

  let results = "";

  if (!isNaN(hb)) {
    if (hb < 12)
      results += `<p>Hemoglobin: <span class='low'>Low</span> — Consider iron-rich foods like spinach, beans, lentils, and lean meats.</p>`;
    else if (hb > 17.5)
      results += `<p>Hemoglobin: <span class='high'>High</span> — Drink more water; high levels may relate to dehydration.</p>`;
    else
      results += `<p>Hemoglobin: Normal.</p>`;
  }

  if (!isNaN(wbc)) {
    if (wbc < 4)
      results += `<p>WBC: <span class='low'>Low</span> — Support immunity with vitamin-C rich foods and adequate sleep.</p>`;
    else if (wbc > 11)
      results += `<p>WBC: <span class='high'>High</span> — This may rise during infections; monitor symptoms.</p>`;
    else
      results += `<p>WBC: Normal.</p>`;
  }

  if (!isNaN(plate)) {
    if (plate < 150)
      results += `<p>Platelets: <span class='low'>Low</span> — Folate, B12-rich foods and hydration may support normal levels.</p>`;
    else if (plate > 450)
      results += `<p>Platelets: <span class='high'>High</span> — Can increase with inflammation; staying hydrated may help.</p>`;
    else
      results += `<p>Platelets: Normal.</p>`;
  }

  document.getElementById("output").innerHTML =
    results || "<p>Please enter all values.</p>";
}