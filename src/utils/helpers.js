import twitchApi from "../apis/twitchApi";

export const getRandom = (options) => {
  const min = Number(options.min) || 1;
  const max = Number(options.max) || 100;
  return Math.round((Math.random() * (max - min)) + min);
};

export const getDateAgoFromTimeStamp = (timestamp) => {
  const fechaActual = new Date().getTime();
  const diferencia = fechaActual - timestamp;
  const segundos = Math.floor(diferencia / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  const meses = Math.floor(dias / 30);
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
  const strTime = `${cantidad} ${unidadTiempo}`;
  return strTime;
};

export const generateUniqueId = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueId = "";

  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomChar = characters.charAt(randomIndex);
    uniqueId += randomChar;
  }

  return uniqueId;
};

// Solo toma encuenta si el ID se encuentra en el slash final y no en un query
export const obtenerIDDesdeURL = (url) => {
  const expresionRegular = /\/([a-zA-Z0-9_-]+)(?:\.[a-zA-Z0-9]+)?(?:\?|$|\/\?|\/$)/;
  const resultado = expresionRegular.exec(url);
  if (resultado && resultado.length > 1) {
    return resultado[1];
  }
  return null;
};

export const obtenerDiscordUserIdFromAvatarsCdn = (url) => {
  const expresionRegular = /\/avatars\/(\d+)\//;
  const resultado = expresionRegular.exec(url);
  if (resultado && resultado.length > 1) {
    return resultado[1];
  }
  return null;
};

export const getTimeUnitsFromISODate = (ISO) => {
  // Fecha proporcionada
  const targetDate = new Date(ISO);

  // Fecha actual
  const today = new Date();

  // Calcula la diferencia en milisegundos
  const msdiff = today - targetDate;

  // Calcula las unidades de tiempo
  const unMinuto = 60 * 1000; // milisegundos en un minuto
  const unaHora = unMinuto * 60; // milisegundos en una hora
  const unDia = unaHora * 24; // milisegundos en un día
  const unMes = unDia * 30.4375; // milisegundos en un mes
  const unAnio = unDia * 365.242189; // milisegundos en un año

  const anios = Math.floor(msdiff / unAnio);
  const meses = Math.floor((msdiff % unAnio) / unMes);
  const dias = Math.floor((msdiff % unMes) / unDia);
  const horas = Math.floor((msdiff % unDia) / unaHora);
  const minutos = Math.floor(msdiff % unaHora / unMinuto);

  // Construye el resultado
  const unidades = [];

  if (anios > 0) {
    unidades.push(`${anios} año${anios !== 1 ? "s" : ""}`);
  }

  if (meses > 0) {
    unidades.push(`${meses} mes${meses !== 1 ? "es" : ""}`);
  }

  if (dias > 0) {
    unidades.push(`${dias} día${dias !== 1 ? "s" : ""}`);
  }

  if (horas > 0) {
    unidades.push(`${horas} hora${horas !== 1 ? "s" : ""}`);
  }

  if (minutos > 0 && anios === 0) {
    unidades.push(`${minutos} minuto${minutos !== 1 ? "s" : ""}`);
  }

  const result = unidades.join(", ");
  return result;
};

export const KVSorterByValue = (KVarray) => {
  return KVarray.sort((a, b) => {
    if (a.metadata.value > b.metadata.value && a.name > b.name) {
      return -1;
    }
  });
};

export const jsonCustomSorterByProperty = (array, customOrderArray, property) => {
  return array.sort((a, b) => {
    const indexA = customOrderArray.indexOf(a[property]);
    const indexB = customOrderArray.indexOf(b[property]);
    if (indexA === -1 && indexB === -1) {
      return 0;
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }
    return indexA - indexB;
  });
};

export const SettedTwitchTagsResponse = async (env, channelId, auth_list, filteredTags, originalLength) => {
  const twitch = new twitchApi(env.client_id, env.client_secret);
  const response = (await Promise.all((auth_list.map(async (users_keys) => {
    if (channelId == users_keys.name) {
      const access_token = await twitch.RefreshToken(users_keys.metadata.value);
      const tagsPatch = await twitch.SetTags(access_token, users_keys.name, filteredTags);
      if (tagsPatch.status === 400 && originalLength <= 10) {
        return "Error. Una etiqueta contiene caracteres inválidos. Las etiquetas deben estar separadas por comas y evitar caracteres especiales o símbolos.";
      } else if (tagsPatch.status === 400 && originalLength > 10) {
        return "Error. La cantidad máxima de etiquetas que puedes establecer es de 10.";
      } else {
        const newTags = String(filteredTags).replaceAll(/,/g, ", ");
        return `Etiquetas del canal actualizadas: ${newTags}`;
      }
    }
  })))).filter(users_keys => users_keys);
  return response[0];
};

export const timeToSeconds = (time) => {
  const isoToSeconds = (iso) => {
    return iso.match(/\d+[HMS]/g).reduce((total, time) => {
      const unit = time.charAt(time.length - 1);
      const value = parseInt(time);
      const formatter = { H: 3600, M: 60, S: 1 };
      return total + (value * formatter[unit]);
    }, 0);
  };

  const hhmmssToSeconds = (time) => {
    const timeArray = time.split(":").map(Number);
    const length = timeArray.length;
    if (length === 3) return timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2];
    else if (length === 2) return timeArray[0] * 60 + timeArray[1];
    return 0; // Formato no reconocido
  };

  if (time.includes("PT")) return isoToSeconds(time);
  else if (time.includes(":")) return hhmmssToSeconds(time);
  return 0; // Formato no reconocido
};

export const defaultRetry = {
  retry: 3, retryDelay: 1000
};

export const socialsCache = {
  instagram: 1209600,
  tiktok: 1209600,
  twitter: 604800,
  kick: 86400,
  youtube: 3600,
  twitch: 1209600
};

export const mimeType = {
  mp2t: "video/mp2t",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  wav: "audio/wav",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  txt: "text/plain; charset=utf-8",
  html: "text/html; charset=utf-8",
  css: "text/css; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  xml: "application/xml; charset=utf-8",
  json: "application/json; charset=utf-8",
  js: "application/javascript; charset=utf-8"
};
