export const getRandom = (max) => {
    return Math.round((Math.random() * (max - 1)) + 1);
};

export const getDateAgoFromTimeStamp = (timestamp) => {
let timestampEspecifico = timestamp;
let fechaActual = new Date().getTime();
let diferencia = fechaActual - timestampEspecifico;

let segundos = Math.round(diferencia / 1000);
let minutos = Math.round(segundos / 60);
let horas = Math.round(minutos / 60);
let dias = Math.round(horas / 24);
let meses = Math.round(dias / 30);

let unidadTiempo;
let cantidad;

if (meses > 0) {
  unidadTiempo = "mes";
  cantidad = meses;
} else if (dias > 0) {
  unidadTiempo = "día";
  cantidad = dias;
} else if (horas > 0) {
  unidadTiempo = "hora";
  cantidad = horas;
} else if (minutos > 0) {
  unidadTiempo = "minuto";
  cantidad = minutos;
} else {
  unidadTiempo = "segundo";
  cantidad = segundos;
}

// Verificar singular o plural
if (cantidad !== 1) {
  if (unidadTiempo == "mes") {
    unidadTiempo += "es";
  } else {
    unidadTiempo += "s";
  }
}

let strTime = `${cantidad} ${unidadTiempo}`;
return strTime;
};