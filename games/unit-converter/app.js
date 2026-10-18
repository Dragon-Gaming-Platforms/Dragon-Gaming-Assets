(() => {
  'use strict';
  const factorUnits = (rows) => rows.map(([name, symbol, factor]) => ({
    name, symbol, toBase: (value) => value * factor, fromBase: (value) => value / factor,
  }));
  const categories = {
    Length: factorUnits([
      ['Millimetre','mm',0.001],['Centimetre','cm',0.01],['Metre','m',1],['Kilometre','km',1000],
      ['Inch','in',0.0254],['Foot','ft',0.3048],['Yard','yd',0.9144],['Mile','mi',1609.344],
    ]),
    Mass: factorUnits([
      ['Milligram','mg',1e-6],['Gram','g',0.001],['Kilogram','kg',1],['Ounce','oz',0.028349523125],
      ['Pound','lb',0.45359237],['Stone','st',6.35029318],['Metric tonne','t',1000],
    ]),
    Volume: factorUnits([
      ['Millilitre','mL',0.001],['Litre','L',1],['Cubic metre','m³',1000],['US teaspoon','tsp',0.00492892159375],
      ['US tablespoon','tbsp',0.01478676478125],['US cup','cup',0.2365882365],['US pint','pt',0.473176473],['US gallon','gal',3.785411784],
    ]),
    Temperature: [
      { name:'Celsius',symbol:'°C',toBase:(v)=>v,fromBase:(v)=>v },
      { name:'Fahrenheit',symbol:'°F',toBase:(v)=>(v-32)*5/9,fromBase:(v)=>v*9/5+32 },
      { name:'Kelvin',symbol:'K',toBase:(v)=>v-273.15,fromBase:(v)=>v+273.15 },
    ],
    Area: factorUnits([
      ['Square centimetre','cm²',0.0001],['Square metre','m²',1],['Square kilometre','km²',1e6],
      ['Square foot','ft²',0.09290304],['Acre','ac',4046.8564224],['Hectare','ha',10000],
    ]),
    Speed: factorUnits([
      ['Metre per second','m/s',1],['Kilometre per hour','km/h',1/3.6],['Mile per hour','mph',0.44704],
      ['Knot','kn',0.514444444444],['Foot per second','ft/s',0.3048],
    ]),
    Time: factorUnits([
      ['Millisecond','ms',0.001],['Second','s',1],['Minute','min',60],['Hour','h',3600],['Day','d',86400],['Week','wk',604800],
    ]),
    'Digital storage': factorUnits([
      ['Bit','bit',1/8],['Byte','B',1],['Kilobyte (SI)','kB',1000],['Megabyte (SI)','MB',1e6],['Gigabyte (SI)','GB',1e9],
      ['Terabyte (SI)','TB',1e12],['Kibibyte (IEC)','KiB',1024],['Mebibyte (IEC)','MiB',1048576],['Gibibyte (IEC)','GiB',1073741824],
    ]),
    Pressure: factorUnits([
      ['Pascal','Pa',1],['Kilopascal','kPa',1000],['Bar','bar',100000],['Atmosphere','atm',101325],['Pound per square inch','psi',6894.757293168],['Torr','Torr',133.322368421],
    ]),
    Energy: factorUnits([
      ['Joule','J',1],['Kilojoule','kJ',1000],['Calorie (thermochemical)','cal',4.184],['Kilocalorie','kcal',4184],
      ['Watt-hour','Wh',3600],['Kilowatt-hour','kWh',3600000],['British thermal unit','BTU',1055.05585262],
    ]),
    Frequency: factorUnits([
      ['Hertz','Hz',1],['Kilohertz','kHz',1000],['Megahertz','MHz',1e6],['Gigahertz','GHz',1e9],
    ]),
    Angle: factorUnits([
      ['Radian','rad',1],['Degree','°',Math.PI/180],['Turn','turn',2*Math.PI],
    ]),
  };
  const $ = (id) => document.getElementById(id);
  const categorySelect = $('category');
  const fromSelect = $('from-unit');
  const toSelect = $('to-unit');

  function selectedUnits() {
    const list = categories[categorySelect.value];
    return [list[Number(fromSelect.value)] || list[0], list[Number(toSelect.value)] || list[1] || list[0]];
  }

  function fillUnitSelects() {
    const list = categories[categorySelect.value];
    for (const select of [fromSelect, toSelect]) {
      select.replaceChildren();
      list.forEach((unit, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = `${unit.name} (${unit.symbol})`;
        select.appendChild(option);
      });
    }
    fromSelect.value = '0';
    toSelect.value = String(list.length > 1 ? 1 : 0);
    convert();
  }

  function fmt(value) {
    if (!Number.isFinite(value)) return '—';
    if (value === 0) return '0';
    const digits = Number($('precision').value);
    return Number(value.toPrecision(digits)).toString();
  }

  function convert() {
    const raw = $('from-value').value;
    const [from, to] = selectedUnits();
    const value = raw === '' ? NaN : Number(raw);
    const result = to.fromBase(from.toBase(value));
    $('to-value').value = fmt(result);
    $('formula').textContent = Number.isFinite(value)
      ? `${fmt(value)} ${from.symbol} = ${fmt(result)} ${to.symbol}`
      : `Enter a numeric value in ${from.symbol}.`;
    $('status').textContent = Number.isFinite(result) ? 'Converted with the bundled local factors.' : 'Enter a finite number to convert.';
  }

  function init() {
    for (const category of Object.keys(categories)) {
      const option = document.createElement('option');
      option.value = category; option.textContent = category;
      categorySelect.appendChild(option);
    }
    categorySelect.value = 'Length';
    fillUnitSelects();
  }

  categorySelect.addEventListener('change', fillUnitSelects);
  fromSelect.addEventListener('change', convert);
  toSelect.addEventListener('change', convert);
  $('from-value').addEventListener('input', convert);
  $('precision').addEventListener('change', convert);
  $('swap').addEventListener('click', () => {
    const oldFrom = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = oldFrom;
    convert();
  });
  $('copy').addEventListener('click', async () => {
    const text = $('to-value').value;
    try {
      await navigator.clipboard.writeText(text);
      $('status').textContent = 'Converted value copied.';
    } catch (_error) {
      $('to-value').focus(); $('to-value').select();
      $('status').textContent = 'Select and copy the result.';
    }
  });
  init();
})();
