import { IttyRouter } from "itty-router";
import { generateUniqueId, getDateAgoFromTimeStamp, getRandom, obtenerIDDesdeURL, obtenerDiscordUserIdFromAvatarsCdn, getTimeUnitsFromISODate, KVSorterByValue, jsonCustomSorterByProperty, SettedTwitchTagsResponse, timeToSeconds } from "./utils/helpers";
import twitchApi from "./apis/twitchApi";
import JsResponse from "./response";
import JsonResponse from "./jsonResponse";
import { OpenAI } from "openai";
import spotifyApi from "./apis/spotifyApi";
import riotApi, { eloValues } from "./apis/riotApi";
import imgurApi from "./apis/imgurApi";
import jp from "jsonpath";
import { lolChampTagAdder } from "./crons/lolChampTagAdder";
import { nbCum, nbFuck, nbFuckAngar, nbHug, nbHugAngar, nbKiss, nbKissAngar, nbKissChino } from "./utils/nightbotEmotes";
import youtubeApi from "./apis/youtubeApi";
import { randUA } from "@ahmedrangel/rand-user-agent";
import snapinstApi from "./apis/snapinstApi";
import mp3youtubeApi from "./apis/mp3youtubeApi";
import y2mateApi from "./apis/y2mateApi";
import crossclipApi from "./apis/crossclipApi";
import fdownloaderApi from "./apis/fdownloaderApi";
// import twitterApi from "./twitterApi";

const router = IttyRouter();
// educar
router.get("/educar/:user/:channel/:touser", async (req, env) => {
  const percent = getRandom(100);
  const { user, touser, channel } = req.params;
  let mensaje = null;
  const response_user = await fetch(`https://decapi.me/twitch/id/${user}`);
  const id_user = await response_user.json();
  const response_touser = await fetch(`https://decapi.me/twitch/id/${touser}`);
  const id_touser = await response_touser.json();
  if (percent < 33) {
    const response_channel = await fetch(`https://decapi.me/twitch/id/${channel}`);
    const id_channel = await response_channel.json();
    const key = id_touser + "-" + id_channel;
    let counter = Number(await env.EDUCAR.get(key));
    if (id_user == id_touser) {
      mensaje = "No puedes educarte a ti mismo, menciona a alguien más. angarW";
    } else {
      counter = counter ? counter + 1 : 1;
      await env.EDUCAR.put(key, counter, {metadata: {value: counter},});
      const veces = counter === 1 ? "vez" : "veces";
      mensaje = `ha educado a ${touser}. ${touser} ha sido educado ${counter} ${veces} en total. angarEz`;
    }
  } else {
    if (id_user == id_touser) {
      mensaje = "No puedes educarte a ti mismo, menciona a alguien más. angarW";
    } else {
      mensaje = `no has podido educar a ${touser}. Quizás la proxima vez tengas mejor suerte. BloodTrail`;
    }
  }

  return new JsResponse(`${mensaje}`);
});

// kiss
router.get("/kiss/:user/:channelID/:touser", async (req, env) => {
  const { user, touser } = req.params;
  const channelId = req.params.channelID;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const userId = await twitch.getId(user);
  const select = await env.NB.prepare(`SELECT count FROM kiss WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  if (userId === touserId) {
    return new JsResponse(`@${user} -> Acaso estás tratando de besarte a ti mismo? uuh`);
  } else {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO kiss (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE kiss SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "beso" : "besos";
    const emote = nbKissAngar[Math.floor(Math.random()*nbKissAngar.length)];
    return new JsResponse(`@${user} -> Le has dado un beso a @${touserName} . Ha recibido ${counter} ${veces} en total. ${emote}`);
  }
});

// fuck
router.get("/fuck/:user/:channelID/:touser", async (req, env) => {
  const { user, touser } = req.params;
  const channelId = req.params.channelID;
  const percent = getRandom(100);
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const userId = await twitch.getId(user);
  const select = await env.NB.prepare(`SELECT count FROM fuck WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  if (userId === touserId) {
    return new JsResponse(`@${user} -> Cómo? estás intentando cog*rte a ti mismo? CaitlynS`);
  } else if (percent < 40) {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO fuck (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE fuck SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "vez" : "veces";
    const emote = nbFuckAngar[Math.floor(Math.random()*nbFuckAngar.length)];
    return new JsResponse(`@${user} -> Le has dado una cog*da a @${touserName} . Ha sido cog*do ${counter} ${veces} en total. ${emote}`);
  } else {
    return new JsResponse(`@${user} -> @${touserName} Se ha logrado escapar. Quizás la proxima vez. BloodTrail`);
  }
});

// fuck v2
router.get("/fuck/v2/:user/:userId/:channelId/:touser", async (req, env) => {
  const { user, userId, channelId, touser } = req.params;
  const percent = getRandom(100);
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const select = await env.NB.prepare(`SELECT count FROM fuck WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  if (userId === touserId) {
    return new JsResponse(`@${user} -> Cómo? estás intentando cog*rte a ti mismo? CaitlynS`);
  } else if (percent < 40) {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO fuck (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE fuck SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "vez" : "veces";
    const emote = nbFuck[Math.floor(Math.random()*nbFuck.length)];
    return new JsResponse(`@${user} -> Le has dado una cog*da a @${touserName} . Ha sido cog*do ${counter} ${veces} en total. ${emote}`);
  } else {
    return new JsResponse(`@${user} -> @${touserName} Se ha logrado escapar. Quizás la proxima vez. BloodTrail`);
  }
});

// hug v2
router.get("/hug/v2/:user/:userId/:channelId/:touser", async (req, env) => {
  const { user, userId, channelId, touser } = req.params;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const select = await env.NB.prepare(`SELECT count FROM hug WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  if (userId === touserId) {
    return new JsResponse(`@${user} -> Estás intentando abrazarte a ti mismo? Acaso te sientes solo? PoroSad`);
  } else {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO hug (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE hug SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "abrazo" : "abrazos";
    const emote = nbHug[Math.floor(Math.random()*nbHug.length)];
    return new JsResponse(`@${user} -> Le has dado un abrazo a @${touserName} . Ha recibido ${counter} ${veces} en total. ${emote}`);
  }
});

// kiss v2
router.get("/kiss/v2/:user/:userId/:channelId/:touser", async (req, env) => {
  const { user, userId, channelId, touser } = req.params;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const select = await env.NB.prepare(`SELECT count FROM kiss WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  if (userId === touserId) {
    return new JsResponse(`@${user} -> Acaso estás tratando de besarte a ti mismo? uuh`);
  } else {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO kiss (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE kiss SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "beso" : "besos";
    const emote = channelId === "750542567" ? nbKissChino[Math.floor(Math.random()*nbKissChino.length)] : nbKiss[Math.floor(Math.random()*nbKiss.length)];
    return new JsResponse(`@${user} -> Le has dado un beso a @${touserName} . Ha recibido ${counter} ${veces} en total. ${emote}`);
  }
});

// cum v2
router.get("/cum/v2/:user/:userId/:channelId/:touser", async (req, env) => {
  const { user, userId, channelId, touser } = req.params;
  const arr = [
    "en la CARA",
    "en la ESPALDA",
    "en el PECHO",
    "en las MANOS",
    "en los PIES",
    "en las TETAS",
    "en la BOCA"
  ];
  const lugar = arr[Math.floor(Math.random()*arr.length)];
  const percent = getRandom(100);
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const select = await env.NB.prepare(`SELECT count FROM cum WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  const emote = nbCum[Math.floor(Math.random()*nbCum.length)];
  if (userId === touserId) {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO cum (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE cum SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "vez" : "veces";
    return new JsResponse(`@${user} -> Has cumeado en ti mismo . Ha sido cumeado ${counter} ${veces} en total. ${emote}`);
  } else if (percent < 50) {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO cum (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE cum SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "vez" : "veces";
    return new JsResponse(`@${user} -> Has cumeado ${lugar} de @${touserName} . Ha sido cumeado ${counter} ${veces} en total. ${emote}`);
  } else {
    return new JsResponse(`@${user} -> Has disparado tu cum pero cayó en el suelo. Apunta mejor la próxima vez. BloodTrail`);
  }
});

// cum
router.get("/cum/:user/:channelID/:touser", async (req, env) => {
  const { user, touser, channelID } = req.params;
  const percent = getRandom(100);
  let mensaje = null;
  const error_msg = `${user}, El usuario que has mencionado no existe. FallHalp`;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  let id_angar = "27457904";
  try {
    const id_user = await twitch.getId(user);
    const id_touser = await twitch.getId(touser);
    const id_channel = channelID;
    const key = id_touser + "-" + id_channel;
    let counter = Number(await env.CUM.get(key));
    let responses_arr = ["en la cara","en la espalda","en el pecho","en las manos","en los pies","en las tetas","en la boca"];
    let lugar = responses_arr[Math.floor(Math.random()*responses_arr.length)];
    if (id_channel == id_angar) {
      let emotes_arr = ["angarMonkas","angarRico","angarGasm"];
      let emote = emotes_arr[Math.floor(Math.random()*emotes_arr.length)];
      if (percent < 40) {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, {metadata: {value: counter},});
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. angarL Te han cumeado ${counter} ${veces} en total. `;
        } else {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, {metadata: {value: counter},});
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user} cumeó ${lugar} de ${touser}. Han cumeado a ${touser} ${counter} ${veces} en total. ${emote}`;
        }
      } else {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, {metadata: {value: counter},});
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. Te han cumeado ${counter} ${veces} en total. angarL Si quieres cumear a alguien más debes mencionarlo`;
        } else {
          mensaje = `${user}, has disparado tu cum pero cayó en el suelo. Apunta mejor la próxima vez. BloodTrail`;
        }
      }
    } else {
      let emotes_arr = ["Kreygasm","angarRico","PogChamp"];
      let emote = emotes_arr[Math.floor(Math.random()*emotes_arr.length)];
      if (percent < 40) {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, {metadata: {value: counter},});
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. Te han cumeado ${counter} ${veces} en total. LUL`;
        } else {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, {metadata: {value: counter},});
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user} cumeó ${lugar} de ${touser}. Han cumeado a ${touser} ${counter} ${veces} en total. ${emote}`;
        }
      } else {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, {metadata: {value: counter},});
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. Te han cumeado ${counter} ${veces} en total. LUL Si quieres cumear a alguien más debes mencionarlo`;
        } else {
          mensaje = `${user}, has disparado tu cum pero cayó en el suelo. Apunta mejor la próxima vez. BloodTrail`;
        }
      }
    }
  } catch (e) {
    mensaje = error_msg;
  }
  return new JsResponse(`${mensaje}`);
});

// hug
router.get("/hug/:user/:channelID/:touser", async (req, env) => {
  const { user, touser } = req.params;
  const channelId = req.params.channelID;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const touserData = await twitch.getUserByName(touser);
  if (!touserData) {
    return new JsResponse(`@${user} -> El usuario que has mencionado no existe. FallHalp`);
  }
  const touserId = touserData.id;
  const touserName = touserData.display_name;
  const userId = await twitch.getId(user);
  const select = await env.NB.prepare(`SELECT count FROM hug WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
  if (userId === touserId) {
    return new JsResponse(`@${user} -> Estás intentando abrazarte a ti mismo? Acaso te sientes solo? PoroSad`);
  } else {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.NB.prepare(`INSERT INTO hug (userId, user, channelId) VALUES ('${touserId}', '${touserName}', '${channelId}')`).first();
    } else {
      await env.NB.prepare(`UPDATE hug SET count = '${counter}', user = '${touserName}' WHERE userId = '${touserId}' AND channelId = '${channelId}'`).first();
    }
    const veces = counter === 1 ? "abrazo" : "abrazos";
    const emote = nbHugAngar[Math.floor(Math.random()*nbHugAngar.length)];
    return new JsResponse(`@${user} -> Le has dado un abrazo a @${touserName} . Ha recibido ${counter} ${veces} en total. ${emote}`);
  }
});

// spank
router.get("/spank/:user/:channelID/:touser", async (req, env) => {
  const { user, touser, channelID } = req.params;
  let mensaje = null;
  const error_msg = `@${user} -> El usuario que has mencionado no existe. FallHalp`;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  try {
    const id_user = await twitch.getId(user);
    const id_touser = await twitch.getId(touser);
    const id_channel = channelID;
    const key = id_touser + "-" + id_channel;
    let counter = Number(await env.SPANK.get(key));
    let emotes_arr = ["angarRico","Kreygasm","Jebaited","TakeNRG"];
    let emote = emotes_arr[Math.floor(Math.random()*emotes_arr.length)];
    let responses_arr = ["le has dado una nalgada","le has marcado sus manos en las nalgas","le has cacheteado la nalga derecha","le has cacheteado la nalga izquierda","le has dado una nalgada con sus dos manos"];
    let accion = responses_arr[Math.floor(Math.random()*responses_arr.length)];
    if (id_user == id_touser) {
      counter = counter ? counter + 1 : 1;
      const veces = counter === 1 ? "nalgada" : "nalgadas";
      await env.SPANK.put(key, counter, {metadata: {value: counter},});
      mensaje = `@${user} -> Te has pegado una nalgada a ti mismo ${emote}. Has recibido ${counter} ${veces} en total.`;
    } else {
      counter = counter ? counter + 1 : 1;
      await env.SPANK.put(key, counter, {metadata: {value: counter},});
      const veces = counter === 1 ? "nalgada" : "nalgadas";
      mensaje = `@${user} -> ${accion} a @${touser} . @${touser} ha recibido ${counter} ${veces} en total. ${emote}`;
    }
  } catch (e) {
    mensaje = error_msg;
  }
  return new JsResponse(`${mensaje}`);
});

// Get Twitch User by ID
router.get("/user/:id_user", async (req, env) => {
  const { id_user } = req.params;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const username = await twitch.getUsername(id_user);
  return new JsResponse(username);
});

// Get Twitch Id by User
router.get("/id/:user", async (req, env) => {
  const { user } = req.params;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const id = await twitch.getId(user);
  return new JsResponse(id);
});

// get top values by Namespace
router.get("/top_users/angar/:env_var", async (req, env, ctx) => {
  let { env_var } = req.params;
  env_var = env_var.toUpperCase();
  let limit = 10;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const KV = (await env[env_var].list()).keys;
  const KV_sorted = KVSorterByValue(KV);
  let top_users_json = KV_sorted.map(users_keys => {
    let user_id = users_keys.name.substr(0, users_keys.name.lastIndexOf("-"));
    let channel_id = users_keys.name.substr(users_keys.name.lastIndexOf("-")+1, String(users_keys.name).length);
    if (channel_id=="27457904") {
      let msg = `{"usuario": "${user_id}", "valor": ${users_keys.metadata.value}, "tipo": "${env_var}", "canal": "${channel_id}"}`;
      return msg;
    }
  }).filter(user_keys => user_keys);

  let top_users_limited_array = top_users_json.slice(0,limit);

  let top_users = (await Promise.all((top_users_limited_array.map(async(top_users_limited_array) => {
    let json = JSON.parse(top_users_limited_array);
    let user = await twitch.getUsername(json.usuario);
    let channel = await twitch.getUsername(json.canal);
    let msg = `{"usuario": "${user}", "valor": ${json.valor}, "tipo": "${env_var}", "canal": "${channel}"}`;
    return msg;
  })))).filter(top_users_limited_array => top_users_limited_array);

  let response = new JsResponse(`[${top_users}]`);
  return response;
});

router.get("/top_users/zihnee/:env_var", async (req, env, ctx) => {
  let { env_var } = req.params;
  env_var = env_var.toUpperCase();
  let limit = 10;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const KV = (await env[env_var].list()).keys;
  const KV_sorted = KVSorterByValue(KV);
  let top_users_json = KV_sorted.map(users_keys => {
    let user_id = users_keys.name.substr(0, users_keys.name.lastIndexOf("-"));
    let channel_id = users_keys.name.substr(users_keys.name.lastIndexOf("-")+1, String(users_keys.name).length);
    if (channel_id=="491738569" && user_id !== "790016126") {
      let msg = `{"usuario": "${user_id}", "valor": ${users_keys.metadata.value}, "tipo": "${env_var}", "canal": "${channel_id}"}`;
      return msg;
    }
  }).filter(user_keys => user_keys);

  let top_users_limited_array = top_users_json.slice(0,limit);

  let top_users = (await Promise.all((top_users_limited_array.map(async(top_users_limited_array) => {
    let json = JSON.parse(top_users_limited_array);
    let user = await twitch.getUsername(json.usuario);
    let channel = await twitch.getUsername(json.canal);
    if (user == false || channel == false) {
      let msg = "";
      return msg;
    } else {
      let msg = `{"usuario": "${user}", "valor": ${json.valor}, "tipo": "${env_var}", "canal": "${channel}"}`;
      return msg;
    }
  })))).filter(top_users_limited_array => top_users_limited_array);

  let response = new JsResponse(`[${top_users}]`);
  return response;
});

router.get("/leaderboards/:channel?", async (req, env) => {
  const { channel } = req.params;
  const { limit } = req.query;
  const { id } = await env.NB.prepare(`SELECT id FROM twitch WHERE login = '${channel.toLowerCase()}'`).first();
  const subSelect = (type) => `SELECT userId, user, count FROM ${type} WHERE channelId = ${id} ORDER BY count DESC LIMIT ${limit}`;
  const joinSelect = (type) => `SELECT userId, user, count, '${type}' as type FROM (${subSelect(type)})`;
  const data = await env.NB.prepare(`
    SELECT t.id, sub.user as display_name, t.avatar, sub.count, sub.type
    FROM twitch t
    JOIN (
        ${joinSelect("fuck")}
        UNION ALL
        ${joinSelect("hug")}
        UNION ALL
        ${joinSelect("kiss")}
        UNION ALL
        ${joinSelect("cum")}
    ) sub
    ON t.id = sub.userId ORDER BY sub.count DESC
  `).all();
  const lists = [];
  const fuck = data?.results.filter(item => item.type === "fuck");
  const hug = data?.results.filter(item => item.type === "hug");
  const kiss = data?.results.filter(item => item.type === "kiss");
  const cum = data?.results.filter(item => item.type === "cum");
  fuck[0] ? lists.push({ type: "fuck", results: fuck }) : null;
  hug[0] ? lists.push({ type: "hug", results: hug }) : null;
  kiss[0] ? lists.push({ type: "kiss", results: kiss }) : null;
  cum[0] ? lists.push({ type: "cum", results: cum }) : null;
  const response = {
    lists: lists,
  };
  return new JsonResponse(response);
});

router.get("/chupar/:user/:channel_id/:query", async (req, env) => {
  const { user, channel_id, query } = req.params;
  const mod_id = "71492353"; // ahmed
  let mensaje = "";
  let query_touser = query.replace("touser:", "");
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const auth_list = (await env.AUTH_USERS.list()).keys;
  if (query == "touser:" || query_touser == user) {
    let response = (await Promise.all((auth_list.map(async(users_keys) => {
      if (mod_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        let chatters = await twitch.getChatters(access_token, channel_id, mod_id);
        chatters = chatters[Math.floor(Math.random() * chatters.length)].user_name;
        return chatters;
      }
    })))).filter(users_keys => users_keys);
    mensaje = `${user} le ha chupado la pija a ${response}`;
  } else {

    mensaje = `${user} le ha chupado la pija a ${query_touser}`;
  }
  return new JsResponse(mensaje);
});

// Openai GPT-3.5-turbo-instruct chatbot AI
router.get("/ia/:prompt/:user", async (req, env) => {
  const { prompt, user } = req.params;
  const openai = new OpenAI({
    apiKey: env.openai_token,
  });
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    prompt: `${user}: ${decodeURIComponent(prompt)}\nGemi:`,
    temperature: 0.7,
    max_tokens: 110,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return new JsResponse(`${response.choices[0].text.replaceAll("\n"," ")}`);
});

// Openai GPT-3.5-turbo-instruct Translator AI  with Language detection
router.get("/ai/translate/:prompt", async (req, env) => {
  const { prompt } = req.params;
  const openai = new OpenAI({
    apiKey: env.openai_token,
  });
  const detectlanguage_url = "https://ws.detectlanguage.com/0.2/detect";
  const detect = await fetch(detectlanguage_url, {
    method: "POST",
    body: JSON.stringify({q: decodeURIComponent(prompt)}),
    headers: {
      "Authorization": "Bearer " + env.detectlanguage_token,
      "Content-Type": "application/json"
    },
  });
  const {data} = await detect.json();
  const IA = async(to_language) => {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Translate this into 1. ${to_language}\n${decodeURIComponent(prompt)}\n1.`,
      temperature: 0.3,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response.choices[0].text;
  };
  const { detections } = data;
  const { language } = detections[0];
  console.log(language);
  if (language == "es") {
    let to_language = "English";
    let response = await IA(to_language);
    return new JsResponse(response);
  } else if (language == "en" || language == "fr") {
    let to_language = "Spanish";
    console.log(to_language);
    let response = await IA(to_language);
    console.log(response);
    return new JsResponse(response);
  } else {
    let response = "Error. Unable to detect English, Spanish or French language in the message you have written";
    console.log(response);
    return new JsResponse(response);
  }
});

// Openai GPT-3.5 chatbot AI for Discord
router.get("/dc/ai/:user/:prompt", async (req, env) => {
  const prompt = decodeURIComponent(req.params.prompt);
  const user = decodeURIComponent(req.params.user);
  const botName = "Gemi-Chan";
  const direct_prompt = `${user}: ${prompt}`;
  const separator = "$SEP$";
  console.log("User: "+user);
  console.log("Prompt: "+prompt);
  const openai = new OpenAI({
    apiKey: env.openai_token,
  });
  let historyRaw = await env.R2gpt.get("history.txt");
  let history;
  historyRaw = await historyRaw?.text();
  if (!historyRaw) {
    history = "";
    historyRaw = `${direct_prompt}${separator}${botName}:`;
  } else {
    const prompt_history = historyRaw.split(separator);
    if (prompt_history.length > 7) {
      prompt_history.shift();
    }
    historyRaw = `${prompt_history.join(separator)}${direct_prompt}${separator}${botName}:`;
    history = prompt_history.join("\n");
  }
  const context = `${history}${direct_prompt}\n${botName}:`;
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    prompt: context,
    temperature: 0.7,
    max_tokens: 1200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const completion = (String.raw`${(response.choices[0].text)}${separator}`).replaceAll(/\\/g,"\\\\");;
  const value = historyRaw + completion;

  // Put R2
  const httpHeaders = {"Content-Type": "text/plain; charset=utf-8"};
  const headers = new Headers(httpHeaders);
  await env.R2gpt.put("history.txt", value, {httpMetadata: headers});
  return new JsResponse(`${response.choices[0].text}`);
});

router.get("/dc/image-generation/:prompt", async (req, env) => {
  let { prompt } = req.params;
  prompt = decodeURIComponent(prompt);
  let image_url = "";
  try {
    const openai = new OpenAI({
      apiKey: env.openai_token,
    });
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    });
    let openai_b64 = response.data.data[0].b64_json;
    const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
    const auth_list = (await env.AUTH_USERS.list()).keys;
    const imgur_user = "imgur_ahmedrangel";
    let imgur_url = (await Promise.all((auth_list.map(async(users_keys) => {
      if (imgur_user == users_keys.name) {
        const { access_token } = await imgur.RefreshToken(users_keys.metadata.value);
        const respuesta = await imgur.UploadImage(access_token, prompt, openai_b64, "AI DALL-E");
        const imgurl = respuesta.data.link;
        return imgurl;
      }
    })))).filter(users_keys => users_keys);
    image_url = imgur_url;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data.error.message);
      image_url = error.response.data.error.message;
    } else {
      console.log(error.message);
      image_url = error.message;
    }
  }
  return new JsResponse(image_url);
});

router.get("/dc/image-variation/:url", async (req, env) => {
  let { url } = req.params;
  let image_url = "";
  let url_fetch;
  let cloudinary_url = "";
  url = decodeURIComponent(url);
  const filename = url.replace(/^.*[\\\/]/, "").replace(/\?.*$/, "");
  const file_extension = filename.replace(/^.*\./, "");
  const filename_id = url.replace(/^.*[\\\/]/, "").replace(/\.[^/.]+$/, "");
  const fdCloudinary = new FormData();
  console.log(filename_id);
  fdCloudinary.append("file", url);
  fdCloudinary.append("upload_preset", "evtxul2d");
  fdCloudinary.append("api_key", env.cloudinary_token);
  fdCloudinary.append("public_id", filename_id);
  const cloudinary_api = "https://api.cloudinary.com/v1_1/dqkzmhvhf/image/upload";
  if (file_extension == "jpg") {
    console.log("es JPG");
    const cloudinary_fetch = await fetch(cloudinary_api, {
      method: "POST",
      body: fdCloudinary
    });
    const cloudinary_response = await cloudinary_fetch.json();
    cloudinary_url = cloudinary_response.secure_url;
    url_fetch = await fetch(cloudinary_url);
  } else {
    console.log("es PNG");
    const cloudinary_fetch = await fetch(cloudinary_api, {
      method: "POST",
      body: fdCloudinary
    });
    const cloudinary_response = await cloudinary_fetch.json();
    cloudinary_url = cloudinary_response.secure_url;
    url_fetch = await fetch(url);
  }
  const blob = await url_fetch.blob();
  const blob_png = new Blob([blob], { type: "image/png" });
  try {
    const file = blob_png;
    const formData = new FormData();
    formData.append("image", file, "image.png");
    formData.append("n", "1");
    formData.append("size", "1024x1024");
    formData.append("response_format", "b64_json");
    const variation_fetch = "https://api.openai.com/v1/images/variations";
    const openaifetch = await fetch(variation_fetch, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.openai_token}`,
      },
      body: formData
    });
    const response = await openaifetch.json();
    let openai_b64 = response.data[0].b64_json;
    const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
    const auth_list = (await env.AUTH_USERS.list()).keys;
    const imgur_user = "imgur_ahmedrangel";
    let imgur_url = (await Promise.all((auth_list.map(async(users_keys) => {
      if (imgur_user == users_keys.name) {
        const { access_token } = await imgur.RefreshToken(users_keys.metadata.value);
        const respuesta = await imgur.UploadImage(access_token, "Variación de: " + filename, openai_b64);
        const imgurl = respuesta.data.link;
        return imgurl;
      }
    })))).filter(users_keys => users_keys);
    image_url = imgur_url;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data.error.message);
      image_url = error.response.data.error.message;
    } else {
      console.log(error.message);
      image_url = error.message;
    }
  }
  return new JsonResponse({original: cloudinary_url, variation: String(image_url)});
});

// Twitch Auth that redirect to oauth callback to save authenticated users
router.get("/twitch/auth", async (req, env) => {
  const { scopes } = req.query;
  const allScopes = "user:read:email bits:read channel:manage:broadcast channel:read:subscriptions channel:manage:moderators moderator:read:chatters moderator:manage:shoutouts moderator:read:followers user:read:follows moderation:read moderator:manage:banned_users";
  const redirect_uri = env.WORKER_URL + "/twitch/user-oauth";
  const dest = new URL("https://id.twitch.tv/oauth2/authorize?"); // destination
  dest.searchParams.append("client_id", env.client_id);
  dest.searchParams.append("redirect_uri", redirect_uri);
  dest.searchParams.append("response_type", "code");
  dest.searchParams.append("scope", scopes === "all" ? allScopes : decodeURIComponent(scopes));
  console.log(dest);
  return Response.redirect(dest, 302);
});

// oauth callback for getin twitch user access token
router.get("/twitch/user-oauth?", async (req, env) => {
  const { query } = req;
  console.log(query);
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const redirect_uri = env.WORKER_URL + "/twitch/user-oauth";
  if (query.code && query.scope) {
    const response = await twitch.OauthCallback(query.code, redirect_uri);
    const { access_token, refresh_token, expires_in } = await response.json();
    const validation = await twitch.Validate(access_token);
    const { login, user_id } = await validation.json();
    const key = user_id;
    await env.AUTH_USERS.put(key, refresh_token, {metadata: {value: refresh_token},});
    return new JsResponse(`Usuario autenticado: ${login}\nID: ${user_id}\nAccess Token: ${access_token}`);
  }
  return new JsResponse("Error. Authentication failed.");
});

// Nightbot command: get Top Bits Cheerers Leaderboard with 3 pages
router.get("/leaderboard/:channelID/:page", async (req, env) => {
  const { channelID, page } = req.params;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const auth_list = (await env.AUTH_USERS.list()).keys;
  const break_line = "────────────────────────────────";
  let msg = "";
  let dots = "_";
  let response ="";
  const insert = (str, index, value) => {
    return str.substr(0, index) + value + str.substr(index);
  };
  for(let i = 0; i < auth_list.length; i++) {
    let user_key = auth_list[i].name;
    if (channelID == user_key) {
      const access_token = await twitch.RefreshToken(auth_list[i].metadata.value);
      const data = await twitch.getBitsLeaderBoard(access_token);
      if (page == 1) {
        for(let i = 0; i < 5; i++) {
          msg = msg + insert(`${data[i].rank})${data[i].user_name}${data[i].score} bits `, String(data[i].rank).length + String(data[i].user_name).length + 1, dots.repeat(42 - (String(data[i].rank).length + String(data[i].user_name).length + String(data[i].score).length + 3)));
          response = `Top bits totales del 1 al 5 ${break_line} ${msg} ${break_line}`;
        }
      } else if (page == 2) {
        for(let i = 5; i < 10; i++) {
          msg = msg + insert(`${data[i].rank})${data[i].user_name}${data[i].score} bits `, String(data[i].rank).length + String(data[i].user_name).length + 1, dots.repeat(42 - (String(data[i].rank).length + String(data[i].user_name).length + String(data[i].score).length + 3)));
          response = `Top bits totales del 6 al 10 ${break_line} ${msg} ${break_line}`;
        }
      } else if (page == 3) {
        for(let i = 10; i < 15; i++) {
          msg = msg + insert(`${data[i].rank})${data[i].user_name}${data[i].score} bits `, String(data[i].rank).length + String(data[i].user_name).length + 1, dots.repeat(42 - (String(data[i].rank).length + String(data[i].user_name).length + String(data[i].score).length + 3)));
          response = `Top bits totales del 11 al 15 ${break_line} ${msg} ${break_line}`;
        }
      } else {
        response = "Error, page not found.";
      }
      return new JsResponse(response);
    }
  }
});
// Get Stream Tags
router.get("/tags/:channelID", async (req, env) => {
  const { channelID } = req.params;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const actualtags = await twitch.getBroadcasterInfo(channelID);
  const response = String(actualtags.tags);
  console.log(response);
  return new JsResponse(response);
});

// Nightbot command: Set Stream Tags
router.get("/set_tags/:channelID/:query", async (req, env) => {
  const { channelID, query } = req.params;
  let query_tags = decodeURIComponent(query);
  query_tags = query_tags.replaceAll(" ","").replace("tags:","").split(",");
  let tags_length = query_tags.length;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  if (query == "tags:") {
    let actualtags = await twitch.getBroadcasterInfo(channelID);
    const response = `Etiquetas actuales: ${String(actualtags.tags).replaceAll(/,/g,", ")}`;
    return new JsResponse(response);
  }
  const auth_list = (await env.AUTH_USERS.list()).keys;
  const response = await SettedTwitchTagsResponse(env, channelID, auth_list, query_tags, tags_length);
  return new JsResponse(response);
});

// Nightbot command: Add Mod
router.get("/addmod/:user_id/:channel_id/:touser", async (req, env) => {
  const { user_id, channel_id, touser } = req.params;
  const ahmed = "71492353";
  let response = "";
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  if (user_id == ahmed || user_id == channel_id) {
    const auth_list = (await env.AUTH_USERS.list()).keys;
    response = (await Promise.all((auth_list.map(async(users_keys) => {
      if (channel_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        console.log(touser);
        const to_user = await twitch.getId(touser);
        const add_mod = await twitch.AddMod(access_token, users_keys.name, to_user);
        if (add_mod.status === 400 && to_user !== false) {
          console.log(add_mod);
          return "Error. El usuario ya es moderador del canal.";
        } else if (add_mod.status === 422) {
          return "Error. Este usuario es VIP. Para convertirlo en moderador primero debe remover el VIP.";
        } else if (to_user === false) {
          return "Error. Usuario no encontrado.";
        } else {
          return `El usuario: @${touser}, ha obtenido privilegios de moderador.`;
        }
      }
    })))).filter(users_keys => users_keys);
    console.log (response);
  } else {
    response = "No tienes permiso para realizar esta acción.";
  }
  return new JsResponse(response);
});

// Nightbot command: Remove Mod
router.get("/unmod/:user_id/:channel_id/:touser", async (req, env) => {
  const { user_id, channel_id, touser } = req.params;
  const ahmed = "71492353";
  let response = "";
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  if (user_id == ahmed || user_id == channel_id) {
    const auth_list = (await env.AUTH_USERS.list()).keys;
    response = (await Promise.all((auth_list.map(async(users_keys) => {
      if (channel_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        console.log(touser);
        const to_user = await twitch.getId(touser);
        const unmod = await twitch.UnMod(access_token, users_keys.name, to_user);
        if (unmod.status === 400 && to_user !== false) {
          return "Error. Este usuario no es moderador";
        } else if (to_user === false) {
          return "Error. Usuario no encontrado.";
        } else {
          return `El usuario: @${touser}, ha dejado de ser moderador`;
        }
      }
    })))).filter(users_keys => users_keys);
    console.log (response);
  } else {
    response = "No tienes permiso para realizar esta acción.";
  }
  return new JsResponse(response);
});

// Nightbot command: Shoutout
router.get("/shoutout/:user/:channel/:channel_id/:touser", async (req, env) => {
  const { user, channel ,channel_id, touser } = req.params;
  if (user.toLowerCase() === touser.toLowerCase()) {
    return new JsResponse(`@${user} -> No puedes hacer shoutout a ti mismo.`);
  }
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const auth_list = (await env.AUTH_USERS.list()).keys;
  const response = (await Promise.all((auth_list.map(async(users_keys) => {
    if (channel_id !== users_keys.name) return;
    const access_token = await twitch.RefreshToken(users_keys.metadata.value);
    console.log(touser);
    const touser_id = await twitch.getId(touser);
    if (!touser_id) {
      return `@${user} -> No se ha podido hacer shoutout, el usuario mencionado no existe.`;
    }
    const shoutout = await twitch.ShoutOut(access_token, channel_id, touser_id);
    console.log(shoutout);
    if (shoutout?.status == 400) {
      return `@${user} -> ${channel} no está en vivo o no tiene espectadores.`;
    } else if (shoutout?.status == 429) {
      return `@${user} -> En este momento no es posible realizar un shoutout. Vuelve a intentarlo más tarde.`;
    }
    return `/announce Todos vayan a seguir a @${touser} https://twitch.tv/${touser.toLowerCase()}`;
  })))).filter(users_keys => users_keys);
  return new JsResponse(response);
});

// Spotify Auth that redirect to oauth callback to save authenticated users
router.get("/spotify/auth", async (req, env) => {
  const redirect_uri = env.WORKER_URL + "/spotify/user-oauth";
  const scopes = "user-read-private user-read-currently-playing";
  const dest = new URL("https://accounts.spotify.com/authorize?"); // destination
  dest.searchParams.append("client_id", env.spotify_client_id);
  dest.searchParams.append("redirect_uri", redirect_uri);
  dest.searchParams.append("response_type", "code");
  dest.searchParams.append("scope", scopes);
  console.log(dest);
  return Response.redirect(dest, 302);
});

// oauth callback for getting spotify user access token
router.get("/spotify/user-oauth?", async (req, env) => {
  const { query } = req;
  console.log(query);
  const spotify = new spotifyApi(env.spotify_client_id, env.spotify_client_secret);
  const redirect_uri = env.WORKER_URL + "/spotify/user-oauth";
  if (query.code) {
    const response = await spotify.OauthCallback(query.code, redirect_uri);
    const { access_token, refresh_token, expires_in } = await response.json();
    const current_user = await spotify.GetCurrentUser(access_token);
    const { id, display_name } = await current_user.json();
    const key = "spotify_"+id;
    await env.AUTH_USERS.put(key, refresh_token, {metadata: {value: refresh_token},});
    console.log(`User: ${display_name}\nID: ${key}\nAccess Token: ${access_token}\nRefresh Token: ${refresh_token}\nExpires in: ${expires_in}`);
    return new JsResponse(`User: ${display_name}\nID: ${key}\nAccess Token: ${access_token}\nRefresh Token: ${refresh_token}\nExpires in: ${expires_in}`);
  } else {
    return new JsResponse("Error. Authentication failed.");
  }
});

// get current spotify playing track
router.get("/spotify/current_playing/:channelID/:channel", async (req, env) => {
  const { channelID, channel } = req.params;
  console.log(channel);
  const zihnee = "491738569";
  const break_line = "────────────────────────────────";
  try {
    if (channelID == zihnee) {
      const auth_list = (await env.AUTH_USERS.list()).keys;
      let response = (await Promise.all((auth_list.map(async(users_keys) => {
        if ("spotify_21bzdcprfxsmlthwssmrnr2si" == users_keys.name) {
          const spotify = new spotifyApi(env.spotify_client_id, env.spotify_client_secret);
          const access_token = await spotify.RefreshToken(users_keys.metadata.value);
          const data = await spotify.GetCurrentlyPlayingTrack(access_token);
          const {item} = await data.json();
          const {artists} = item;
          const {name} = item;
          const {external_urls} = item;
          const track_url = external_urls.spotify;
          let artists_names = artists.map(artists => {
            let names = artists.name;
            return names;
          }).filter(artists => artists);
          const track = artists_names.toString().replaceAll(",",", ") + " - " + name + " " + track_url;
          return track;
        }
      })))).filter(users_keys => users_keys);
      return new JsResponse(`La canción que ${channel} está escuchando en Spotify ahora mismo es: ${break_line} ${response}`);
    }
  } catch (e) {
    return new JsResponse(`${channel} no está reproduciendo música en Spotify actualemnte.`);
  }
});

router.get("/put/discord-avatars?", async (req, env,) => {
  const url = req.query.url;
  const id = obtenerIDDesdeURL(url);
  const userId = obtenerDiscordUserIdFromAvatarsCdn(url);
  const data = await fetch(url);
  const blob = await data.blob();
  const object = await env.R2cdn.put(`discord-avatars/${userId}/${id}`, blob);
  return new JsResponse(JSON.stringify(object));
});

router.get("/put-r2-gemi-chan?", async (req, env, ctx) => {
  const { query } = req;
  const video_url = query.video_url;
  if (video_url) {
    const f = await fetch(video_url);
    const b = await f.blob();
    const type = "video/mp4";
    const httpHeaders = {"Content-Type": type, "Content-Disposition": "attachment"};
    const headers = new Headers(httpHeaders);
    const uniqueId = generateUniqueId();

    const putR2 = async(id) => {
      const object = await env.R2cdn.put(`gemi-chan/${id}.mp4`, b, {httpMetadata: headers});
      console.log(`escrito: ${id}`);
      return `https://cdn.ahmedrangel.com/gemi-chan/${id}.mp4`;
    };

    const comprobarCDN = async(id) => {
      const comprobar = await fetch(`https://cdn.ahmedrangel.com/gemi-chan/${id}.mp4`);
      if (comprobar.status === 200) {
        console.log("existe, generar nuevo id, y volver a comprobar");
        const uniqueId = generateUniqueId();
        return await comprobarCDN(uniqueId);
      }
      console.log("no existe, put en r2cdn");
      return await putR2(id);
    };
    const response = await comprobarCDN(uniqueId);
    return new JsResponse(response);
  }
  return new JsResponse("Error. No se ha encontrado un video.");
});

router.get("/put-r2-chokis?", async (req, env, ctx) => {
  const { query } = req;
  const video_url = query.video_url;
  console.log(video_url);
  if (video_url) {
    const f = await fetch(video_url);
    const b = await f.blob();
    const type = "video/mp4";
    const httpHeaders = {"Content-Type": type, "Content-Disposition": "attachment"};
    const headers = new Headers(httpHeaders);
    const uniqueId = generateUniqueId();

    const putR2 = async(id) => {
      const object = await env.R2cdn.put(`chokis/${id}.mp4`, b, {httpMetadata: headers});
      console.log(`escrito: ${id}`);
      return `https://cdn.ahmedrangel.com/chokis/${id}.mp4`;
    };

    const comprobarCDN = async(id) => {
      const comprobar = await fetch(`https://cdn.ahmedrangel.com/chokis/${id}.mp4`);
      if (comprobar.status === 200) {
        console.log("existe, generar nuevo id, y volver a comprobar");
        const uniqueId = generateUniqueId();
        return await comprobarCDN(uniqueId);
      }
      console.log("no existe, put en r2cdn");
      return await putR2(id);
    };
    const response = await comprobarCDN(uniqueId);
    return new JsResponse(response);
  }
  return new JsResponse("Error. No se ha encontrado un video.");
});

router.get("/lol/live-game?", async (req, env,) => {
  const { query } = req;
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  let q_summoner;
  let q_region;
  let data = [];
  let team1String = [], team1 = [];
  let team2String = [], team2 = [];
  let tier = "";
  let rank = "";
  let division = "";
  let lp = "";
  let dots = "_";
  // Decode al query, reemplaza espacios por (-), elimina caracteres especiales
  let query_string = decodeURIComponent(query.query).replaceAll(/ /g, "-").replaceAll(/[^a-zA-Z0-9\-]/g, "", "");
  query_string = query_string.replace(/-+$/, ""); // elimina el overflow de guiones al final de la cadena
  // Si el query no está vacío se separa el usuario y la región, de lo contrario se usa el usuario y region definido.
  if (query_string !== "") {
    let lastSpaceIndex = query_string.lastIndexOf("-");
    if (lastSpaceIndex !== -1) {
      q_summoner = query_string.substr(0, lastSpaceIndex).replaceAll(/-/g, "");
      q_region = query_string.substr(lastSpaceIndex + 1);
    } else {
      q_summoner = query_string;
    }
    console.log(q_summoner + " " + q_region);
  } else {
    q_summoner = "Zihne";
    q_region = "las";
  }
  const riot = new riotApi(env.riot_token);
  const break_line = "─────────────────────────";
  console.log(q_region);
  const region = riot.RegionNameRouting(q_region);
  console.log(region);
  if (q_summoner && region !== false && q_region !== undefined) {
    const ddversions = await fetch(`https://ddragon.leagueoflegends.com/realms/${q_region.toLowerCase()}.json`);
    const ddversions_data = await ddversions.json();
    const champion_list = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.champion}/data/es_MX/champion.json`);
    const champion_data = await champion_list.json();
    const summoner_data = await riot.SummonerDataByName(q_summoner, region);
    const summoner_id = summoner_data.id;
    const live_game_data = await riot.LiveGameData(summoner_id, region);
    const game_type = riot.queueCase(live_game_data.gameQueueConfigId);
    if (live_game_data.participants) {
      const participants = live_game_data.participants;
      const team_size = participants.length;
      for (let i = 0; i < team_size; i++) {
        if (participants[i].teamId == 100) {
          const blue_team = "🔵";
          await AdjustParticipants(participants[i], team1, region, game_type.profile_rank_type, blue_team, champion_data);
        } else if (participants[i].teamId == 200) {
          const red_team = "🔴";
          await AdjustParticipants(participants[i], team2, region, game_type.profile_rank_type, red_team, champion_data);
        }
      }
      const ratesFetch = await fetch("https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json");
      const merakiRates = await ratesFetch.json();
      team1.forEach(t => {
        t.role = riot.championRole(t.championId, merakiRates);
      });
      team2.forEach(t => {
        t.role = riot.championRole(t.championId, merakiRates);
      });
      team1 = riot.fixJsonJungleSort(jsonCustomSorterByProperty(team1, roles, "role"));
      team2 = riot.fixJsonJungleSort(jsonCustomSorterByProperty(team2, roles, "role"));
      console.log(team1);
      console.log(team2);
      team1.forEach(t => {
        team2String.push(`${t.teamColor}${t.summonerName}(${t.championName})${t.dots}${t.division}${t.lp}`);
      });
      team2.forEach(t => {
        team2String.push(`${t.teamColor}${t.summonerName}(${t.championName})${t.dots}${t.division}${t.lp}`);
      });

      data = String((`${game_type.queue_name} ${break_line} ${String(team1String)} ${String(team2String)}`).replaceAll(","," "));
    } else {
      data = `${q_summoner} no se encuentra en partida ahora mismo. FallHalp `;
    }
  } else if (region == false) {
    data = "No se ha especificado la región o la región es incorrecta. Manera correcta: !lolgame <invocador> <region>";
  }

  async function AdjustParticipants (participants, team, region, game_type, team_color, champion_data) {
    participants.championName = (String(jp.query(champion_data.data, `$..[?(@.key==${participants.championId})].name`)));
    let summonerName = participants.summonerName.charAt(0);
    let sn2 = participants.summonerName.slice(1);
    sn2 = sn2.toLowerCase();
    summonerName = summonerName + sn2;
    const ranked_data = await riot.RankedData(participants.summonerId, region);
    const current_rank_type = (String(jp.query(ranked_data, `$..[?(@.queueType=="${game_type}")].queueType`)));
    if (ranked_data.length != 0 && game_type == current_rank_type) {
      for (let i = 0; i < ranked_data.length; i++) {
        if (ranked_data[i].queueType == current_rank_type) {
          lp = "_"+ranked_data[i].leaguePoints+"LP";
          tier = ranked_data[i].tier;
          rank = ranked_data[i].rank;
        }
      }
    } else {
      lp = "";
      tier = false;
      rank = false;
    }
    division = riot.divisionCase(riot.tierCase(tier).short, riot.rankCase(rank));
    let names_size = (42 - (String(participants.championName).length + String(participants.summonerName).length + 17));
    let teamObj = {
      teamColor: team_color,
      summonerName: summonerName.replaceAll(" ",""),
      championName: participants.championName.replaceAll(" ",""),
      championId: participants.championId,
      spell1Id: participants.spell1Id,
      spell2Id: participants.spell2Id,
      division: division,
      lp: lp,
    };
    if (names_size <= 0) {
      names_size = 0;
      dots = "";
      teamObj.dots = dots;
      team.push(teamObj);
    } else {
      dots = "_";
      teamObj.dots = dots.repeat(names_size);
      team.push(teamObj);
    }
  };
  console.log(data);
  return new JsResponse(data);
});

router.get("/lol/spectator/:region/:name/:tag", async (req, env,) => {
  const { params } = req;
  const region = (params.region).toLowerCase();
  const riotName = params.name;
  const riotTag = params.tag;
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  const team1 = [], team2 = [];
  const match = {};
  match.status_code = 404;
  const riot = new riotApi(env.riot_token);
  const region_route = riot.RegionNameRouting(region);
  const cluster = riot.RegionalRouting(region);
  const ddversions = await fetch(`https://ddragon.leagueoflegends.com/realms/${region.toLowerCase()}.json`);
  const ddversions_data = await ddversions.json();
  const champion_list = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.champion}/data/es_MX/champion.json`);
  const champion_data = await champion_list.json();
  const account_data = await riot.getAccountByRiotID(riotName, riotTag, cluster);
  const puuid = account_data.puuid;
  const live_game_data = await riot.LiveGameData(puuid, region_route);
  const game_type = riot.queueCase(live_game_data?.gameQueueConfigId);
  const participantsHandler = async(p, merakiRates, game_type, team, color) => {
    const ranked_data = await riot.RankedData(p.summonerId, region_route);
    const current_rank_type = (String(jp.query(ranked_data, `$..[?(@.queueType=="${game_type.profile_rank_type}")].queueType`)));
    const role = riot.championRole(p.championId, merakiRates);
    const championName = (String(jp.query(champion_data.data, `$..[?(@.key==${p.championId})].name`)));
    if (ranked_data.length !== 0 && game_type.profile_rank_type === current_rank_type) {
      ranked_data.forEach(r => {
        if (r.queueType === game_type.profile_rank_type) {
          const tierFull = riot.tierCase(r.tier).full.toUpperCase();
          const division = riot.divisionCase(riot.tierCase(r.tier).short, riot.rankCase(r.rank));
          const rankInt = riot.rankCase(r.rank);
          const eloValue = eloValues[r.tier + " " + r.rank];
          const rank = r.tier !== "MASTER" && r.tier !== "GRANDMASTER" && r.tier !== "CHALLENGER" ? r.rank : "";
          team.push({
            teamColor: color,
            riotId: p.riotId,
            championId: p.championId,
            championName: championName,
            spell1Id: p.spell1Id,
            spell2Id: p.spell2Id,
            lp: r.leaguePoints,
            tier: r.tier,
            rank: rank,
            rankInt: rankInt,
            division: division,
            tierFull: tierFull,
            eloValue: eloValue,
            wins: r.wins,
            losses: r.losses,
            role: role,
          });
        }
      });
    } else {
      team.push({
        teamColor: color,
        summonerName: p.summonerName,
        championId: p.championId,
        championName: championName,
        spell1Id: p.spell1Id,
        spell2Id: p.spell2Id,
        role: role,
      });
    }
  };
  if (live_game_data.participants) {
    const ratesFetch = await fetch("https://cdn.merakianalytics.com/riot/lol/resources/latest/en-US/championrates.json");
    const merakiRates = await ratesFetch.json();
    const participants = live_game_data.participants;
    for (const p of participants) {
      if (p.teamId === 100) {
        await participantsHandler(p, merakiRates, game_type, team1, "blue");
      } else if (p.teamId === 200) {
        await participantsHandler(p, merakiRates, game_type, team2, "red");
      }
    }
    match.status_code = 200;
    const t1Sorted = riot.fixJsonJungleSort(jsonCustomSorterByProperty(team1, roles, "role"));
    const t2Sorted = riot.fixJsonJungleSort(jsonCustomSorterByProperty(team2, roles, "role"));
    match.team1 = { participants: t1Sorted };
    match.team2 = { participants: t2Sorted };
    const eloAvg = (team) => {
      const eloArray = [];
      team.forEach(p => {
        if (p.eloValue) {
          eloArray.push(p.eloValue);
        }
      });
      const suma = eloArray.reduce((total, valor) => total + valor, 0);
      const promedio = Math.round(suma / eloArray.length);
      return promedio;
    };
    const eloAvg1 = eloAvg(t1Sorted);
    const eloAvg2 = eloAvg(t2Sorted);
    const eloTierRank = (avg) => {
      let obj = {tier: "DESCONOCIDO", rank: -1};
      for (const eloName in eloValues) {
        if (eloValues[eloName] === avg) {
          const eloNameSplit = eloName.split(" ");
          const eloTier = riot.tierCase(eloNameSplit[0]).full;
          const eloRank = eloNameSplit[0] !== "MASTER" && eloNameSplit[0] !== "GRANDMASTER" && eloNameSplit[0] !== "CHALLENGER" ? eloNameSplit[1] : "";
          obj = {
            tier: eloNameSplit[0],
            rank: eloRank,
            rankInt: riot.rankCase(eloRank),
            tierFull: eloTier.toUpperCase(),
            division: riot.divisionCase(riot.tierCase(eloNameSplit[0]).short, riot.rankCase(eloRank))
          };
          break;
        }
      }
      return obj;
    };
    const elo1 = eloTierRank(eloAvg1);
    const elo2 = eloTierRank(eloAvg2);
    const eloObj = (arr, eloAvg) => {
      return {value: eloAvg, tier: arr.tier, rank: arr.rank, rankInt: arr.rankInt, division: arr.division, tierFull: arr.tierFull};
    };
    match.team1.eloAvg = eloObj(elo1, eloAvg1);
    match.team2.eloAvg = eloObj(elo2, eloAvg2);
    match.queueId = live_game_data.gameQueueConfigId;
    match.gameType = game_type.short_name;
    match.region = region.toUpperCase();
    match.startTime = live_game_data.gameStartTime;
    return new JsonResponse(match);
  }
  return new JsonResponse(match);
});

// LoL Profile (with Riot ID)
router.get("/lol/profile/:region/:name/:tag", async (req, env,) => {
  const { name, tag } = req.params;
  const region = (req.params.region).toLowerCase();
  let profile_data;
  const rank_profile = [], match_history = [];
  const riot = new riotApi(env.riot_token);
  const route = riot.RegionNameRouting(region);
  if (!route) {
    return new JsonResponse({status_code: 404, errorName: "region"});
  }
  const cluster = riot.RegionalRouting(region);
  console.log(region, route, cluster);
  const ddversionsFetch = await fetch(`https://ddragon.leagueoflegends.com/realms/${region}.json`);
  const ddversions = await ddversionsFetch.json();
  const account = await riot.getAccountByRiotID(name, tag, cluster);
  const puuid = account.puuid;
  const summoner = await riot.getSummonerDataByPUUID(puuid, route);
  if (account?.status || summoner?.status) {
    return new JsonResponse({status_code: 404, errorName: "riotId"});
  }
  const summoner_id = summoner.id;
  const challenges_data = await riot.getChellengesData(puuid, route);
  const titleId = challenges_data.preferences.title;
  const challenges_assets = titleId !== "" ? await fetch("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_mx/v1/challenges.json") : null;
  const challenges_json = titleId !== "" ? await challenges_assets.json() : null;
  const titleName = titleId !== "" ? jp.query(challenges_json, `$..[?(@.itemId==${titleId})].name`)[0] : "";
  profile_data = {
    status_code: 200,
    summonerId: summoner_id,
    puuid: puuid,
    riotName: account.gameName,
    riotTag: account.tagLine,
    summonerLevel: summoner.summonerLevel,
    profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/${ddversions.n.profileicon}/img/profileicon/${summoner.profileIconId}.png`,
    region: region,
    route: route,
    titleName: titleName
  };
  const ranked_data = await riot.RankedData(summoner.id, route);
  ranked_data.forEach((rankedData) => {
    if (rankedData.queueType !== "CHERRY") {
      const tier = riot.tierCase(rankedData.tier).full;
      rank_profile.push({
        leagueId: rankedData.leagueId,
        queueType: rankedData.queueType,
        tier: tier,
        rank: rankedData.rank,
        leaguePoints: rankedData.leaguePoints,
        wins: rankedData.wins,
        losses: rankedData.losses
      });
    }
  });
  const queue_sort = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR"];
  rank_profile.sort((a, b) => {
    const soloIndex = queue_sort.indexOf(a?.queueType);
    const flexIndex = queue_sort.indexOf(b?.queueType);
    return soloIndex - flexIndex;
  });
  profile_data.rankProfile = rank_profile;
  const matchesId = await riot.getMatches(puuid, cluster, 10);
  console.log(matchesId);
  const champion_list = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddversions.n.champion}/data/es_MX/champion.json`);
  const champion_data = await champion_list.json();
  for (let i = 0; i < matchesId.length; i++) {
    const match_data = await riot.getMatchFromId(matchesId[i], cluster);
    if (match_data?.status?.status_code !== 404) {
      const gameEndTimestamp = match_data?.info?.gameEndTimestamp;
      const queueId = match_data?.info?.queueId;
      const queueName = riot.queueCase(queueId);
      const participantId = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].summonerId`)[0];
      const championId = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].championId`)[0];
      const championName = jp.query(champion_data.data, `$..[?(@.key==${championId})].name`)[0];
      const kills = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].kills`)[0];
      const deaths = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].deaths`)[0];
      const assists = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].assists`)[0];
      const summoner1Id = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].summoner1Id`)[0];
      const summoner2Id = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].summoner2Id`)[0];
      const remake = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].gameEndedInEarlySurrender`)[0];
      const win = jp.query(match_data, `$..[?(@.summonerId=="${summoner_id}")].win`)[0];
      if (summoner_id == participantId) {
        match_history.push({
          orderId: i,
          gameEndTimestamp: gameEndTimestamp,
          queueName: queueName.short_name,
          championName: championName,
          kills: kills,
          deaths: deaths,
          assists: assists,
          summoner1Id: summoner1Id,
          summoner2Id: summoner2Id,
          win: win,
          remake: remake,
          strTime: getDateAgoFromTimeStamp(gameEndTimestamp)
        });
      }
    }
  }
  profile_data.matchesHistory = match_history;
  return new JsonResponse(profile_data);
});

// LoL MMR (with Riot ID)
router.get("/lol/mmr/:region/:name/:tag/:queue", async (req, env,) => {
  const { name, tag, queue } = req.params;
  const region = (req.params.region).toLowerCase();
  const riot = new riotApi(env.riot_token);
  const route = riot.RegionNameRouting(region);
  if (!route) {
    return new JsonResponse({status_code: 404, errorName: "region"});
  }
  const cluster = riot.RegionalRouting(region);
  const queueId = queue.toLowerCase() === "flex" ? 440 : 420;
  const queueCase = riot.queueCase(queueId);
  let elo_data;
  const samples = [], elo_samples = [];
  const account = await riot.getAccountByRiotID(name, tag, cluster);
  const puuid = account.puuid;
  const summoner = await riot.getSummonerDataByPUUID(puuid, route);
  if (account?.status || summoner?.status) {
    return new JsonResponse({status_code: 404, errorName: "riotId"});
  }
  const ddversionsF = await fetch(`https://ddragon.leagueoflegends.com/realms/${region}.json`);
  const ddversions = await ddversionsF.json();
  elo_data = {
    riotName: account.gameName,
    riotTag: account.tagLine,
    summonerLevel: summoner.summonerLevel,
    profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/${ddversions.n.profileicon}/img/profileicon/${summoner.profileIconId}.png`,
    region: region,
    route: route
  };
  const ranked_data = await riot.RankedData(summoner.id, route);
  console.log(ranked_data);
  if (ranked_data.length === 0) {
    elo_data.status_code = 404;
    elo_data.errorName = "ranked";
  } else {
    for (const el of ranked_data) {
      if (el?.queueType === queueCase.profile_rank_type) {
        const eloTier = riot.tierCase(el.tier).full;
        const eloRank = el.tier !== "MASTER" && el.tier !== "GRANDMASTER" && el.tier !== "CHALLENGER" ? el.rank : "";
        elo_data.ranked = {
          tier: eloTier,
          rank: eloRank,
          wins: el.wins,
          losses: el.losses,
          leaguePoints: el.leaguePoints,
          queueName: queueCase.short_name
        };
        const matchesId = await riot.getMatches(puuid, cluster , 3, queueId);
        for (const matches of matchesId) {
          const match_data = await riot.getMatchFromId(matches, cluster);
          const participants = match_data.info.participants;
          participants.forEach((p) => {
            if (p.puuid !== puuid) {
              samples.push(p.summonerId);
            }
          });
        }
        const fixedSamples = [...new Set(samples)];
        for (const s of fixedSamples) {
          const ranked_data = await riot.RankedData(s, route);
          for (const el of ranked_data) {
            if (el?.queueType === queueCase.profile_rank_type) {
              elo_samples.push(eloValues[el.tier + " " + el.rank]);
            }
          }
        }
        console.log(elo_samples);
        const suma = elo_samples.reduce((total, valor) => total + valor, 0);
        const promedio = Math.round(suma / elo_samples.length);
        for (const eloName in eloValues) {
          if (eloValues[eloName] === promedio) {
            const eloNameSplit = eloName.split(" ");
            const eloTier = riot.tierCase(eloNameSplit[0]).full;
            const eloRank = eloNameSplit[0] !== "MASTER" && eloNameSplit[0] !== "GRANDMASTER" && eloNameSplit[0] !== "CHALLENGER" ? eloNameSplit[1] : "";
            elo_data.avg = {tier: eloTier, rank: eloRank};
            break;
          } else {
            elo_data.avg = {tier: "Desconocido", rank: "Desconocido"};
          }
        }
        elo_data.status_code = 200;
        break;
      } else {
        elo_data.status_code = 404;
        elo_data.errorName = "ranked";
      }
    }
  }
  return new JsonResponse(elo_data);
});

router.get("/rank?", async (req, env,) => {
  const { query } = req;
  const lol = query.lol;
  const val = encodeURIComponent(query.val);
  console.log(val);
  const region = "la2";
  const riot = new riotApi(env.riot_token);
  const { id } = await riot.SummonerDataByName(lol, region);
  const rankedData = await riot.RankedData(id, region);
  let lolRank;
  console.log(rankedData.length);
  if (rankedData.length !== 0) {
    for (const el of rankedData) {
      if (el?.queueType == "RANKED_SOLO_5x5") {
        lolRank = `${riot.tierCase(el.tier).full} ${riot.rankCase(el.rank)}`;
      }
    }
  } else {
    lolRank = "Unranked";
  };
  console.log(lolRank);
  const valFetch = await fetch("https://trackergg-scraper.ahmedrangel.repl.co/val-track?user=" + val);
  const valData = await valFetch.text();
  const valRankStrings = valData.split(" ");
  const valRank = `${riot.tierCase(valRankStrings[0].toUpperCase()).full} ${valRankStrings[1]}`;
  return new JsResponse(`LoL: ${lolRank} | Valo: ${valRank}`);
});

router.get("/imgur/auth", async (req, env) => {
  const dest = new URL("https://api.imgur.com/oauth2/authorize?"); // destination
  dest.searchParams.append("client_id", env.imgur_client_id);
  dest.searchParams.append("response_type", "code");
  console.log(dest);
  return Response.redirect(dest, 302);
});

router.get("/imgur/user-oauth?", async (req, env) => {
  const { query } = req;
  console.log("client_secret "+ env.imgur_client_secret);
  console.log(query.code);
  if (query.code) {
    const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
    const { refresh_token, access_token, expires_in, account_username } = await imgur.OauthCallback(query.code);
    const key = "imgur_"+account_username;
    await env.AUTH_USERS.put(key, refresh_token, {metadata: {value: refresh_token},});
    console.log(`ID: ${key}\nAccess Token: ${access_token}\nRefresh Token: ${refresh_token}\nExpires in: ${expires_in}`);
    return new JsResponse(`ID: ${key}\nAccess Token: ${access_token}\nRefresh Token: ${refresh_token}\nExpires in: ${expires_in}`);
  } else {
    return new JsResponse("Error. Authentication failed.");
  }
});

router.get("/imgur/me/gallery", async (req, env) => {
  const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
  const auth_list = (await env.AUTH_USERS.list()).keys;
  const imgur_user = "imgur_ahmedrangel";
  let json = [];
  let imgur_data = (await Promise.all((auth_list.map(async(users_keys) => {
    if (imgur_user == users_keys.name) {
      const { access_token } = await imgur.RefreshToken(users_keys.metadata.value);
      const data = imgur.GetMyGallery(access_token);
      return data;
    }
  })))).filter(users_keys => users_keys);
  for (const images of imgur_data[0].data) {
    const select = await env.ImgurDiscord.prepare(`SELECT * FROM imgur_discord WHERE imgurId = '${images.id}'`);
    const select_data = await select.first();
    let discordUser;
    if (select_data !== null) {
      discordUser = select_data.discordUser;
    } else {
      discordUser = "";
    }
    json.push({id: images.id, title: images.title, description: images.description, datetime: images.datetime, discordUser: discordUser});
  };
  json = JSON.stringify(json);
  console.log(json);
  return new JsResponse(json);
});


router.get("/d1/insert-imgurdiscord?", async (req, env) => {
  const { query } = req;
  if (query.imgurId && query.discordUser && query.title && query.timestamp && query.command) {
    const insertar = env.ImgurDiscord.prepare(`insert into imgur_discord (imgurId, discordUser, title, timestamp, command) values ('${query.imgurId}', '${query.discordUser}','${query.title}', '${query.timestamp}', '${query.command}')`);
    const data = await insertar.first();
    return new JsResponse(data);
  } else {
    return new JsResponse("No se han encontrado las consultas requeridas en el url");
  }
});

router.get("/d1/select?", async (req, env) => {
  const select = await env.ImgurDiscord.prepare("SELECT * FROM imgur_discord WHERE imgurId = 'QNDm3'");
  const select_data = await select.first();
  if (select_data !== null) {
    console.log("no es null");
  } else {
    console.log("es null, no pushear");
  }
  console.log(select_data);
});

router.get("/dc/instagram-video-scrapper?", async (req, env) => {
  let count = 0;
  let maxTries = 3;
  const scrap = async () => {
    const { query } = req;
    // const _cookie = env.ig_cookie;
    // const _xIgAppId = "936619743392459";
    const url = decodeURIComponent(query.url);
    const getInstagramId = (url) => {
      const regex = /instagram.com\/(?:p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
      const match = url.match(regex);
      return match && match[1] ? match[1] : null;
    };

    const idUrl = getInstagramId(url);

    if (!idUrl) {
      console.log("Invalid url");
      return JSON.stringify({status: 400});
    } else {
      const snapinst = new snapinstApi;
      const items = await snapinst.getMedia(url.includes("/stories") ? url : `https://instagram.com/p/${idUrl}`, "video");
      const video_url = items.url;
      const json_response = {
        video_url: video_url,
        short_url: url.replace(/\?.*$/, "").replace("www.",""),
        caption: null,
        status: 200
      };
      return JSON.stringify(json_response);
    }
  };

  const retryScrap = async () => {
    try {
      return await scrap();
    } catch (error) {
      console.log(error);
      if (count < maxTries) {
        count++;
        return await retryScrap();
      } else {
        const json_error = {status: 429};
        return JSON.stringify(json_error);
      }
    }
  };

  return new JsResponse(await retryScrap());
});

router.get("/dc/youtube/mp3?", async (req, env) => {
  const { url, filter } = req.query;
  const youtube = new youtubeApi(env.youtube_token);
  const mp3youtube = new mp3youtubeApi();
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const videoUrl = decodeURIComponent(url);
  const id = videoUrl.match(regex)[1];
  try {
    const { items } = await youtube.getVideoInfo(id);
    const { snippet, contentDetails } = items[0];
    const duration = timeToSeconds(contentDetails.duration);
    const short_url = "https://youtu.be/" + id;
    let video_url = await mp3youtube.getMedia(id, "audio");
    let maxAttempts = 4;
    while (!video_url && maxAttempts > 0) {
      console.log("Retrying video download (attempt " + (4 - maxAttempts) + ")");
      await new Promise(resolve => setTimeout(resolve, 2000));
      video_url = await mp3youtube.getMedia(id, "audio");
      maxAttempts--;
    }
    if (!video_url) {
      return new JsonResponse({
        error: "No se pudo obtener el video después de varios intentos",
        status: 500
      });
    }
    return new JsonResponse({
      video_url: video_url,
      caption: snippet.title,
      short_url: short_url,
      duration: duration,
      status: 200
    });
  } catch(e) {
    console.log(e);
    return new JsonResponse({ status: 404 });
  }
});

router.get("/dc/youtube-video-scrapper?", async (req, env) => {
  const { url, filter } = req.query;
  const youtube = new youtubeApi(env.youtube_token);
  const y2mate = new y2mateApi();
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]+)/;
  const videoUrl = decodeURIComponent(url);
  const id = videoUrl.match(regex)[1];
  try {
    const { items } = await youtube.getVideoInfo(id);
    const { snippet, contentDetails } = items[0];
    const duration = timeToSeconds(contentDetails.duration);
    const short_url = "https://youtu.be/" + id;
    let video_url = await y2mate.getMedia(id, filter);
    let maxAttempts = 4;
    while (!video_url && maxAttempts > 0) {
      console.log("Retrying video download (attempt " + (4 - maxAttempts) + ")");
      await new Promise(resolve => setTimeout(resolve, 2000));
      video_url = await y2mate.getMedia(id, filter);
      maxAttempts--;
    }
    if (!video_url) {
      return new JsonResponse({
        error: "No se pudo obtener el video después de varios intentos",
        status: 500
      });
    }
    return new JsonResponse({
      video_url: video_url,
      caption: snippet.title,
      short_url: short_url,
      duration: duration,
      status: 200
    });
  } catch(e) {
    console.log(e);
    return new JsonResponse({ status: 404 });
  }
});

router.get("/dc/facebook-video-scrapper?", async (req, env) => {
  const { query } = req;
  const url = decodeURIComponent(query.url);
  const fdownloader = new fdownloaderApi();
  let video_url;
  const short_url = url.replace(/[?&](fs|s|mibextid)=[^&]+/g, "").replace("www.","");
  console.log(short_url);
  let status;
  let maxAttempts = 4;
  while (!video_url && maxAttempts > 0) {
    console.log("Retrying video download (attempt " + (4 - maxAttempts) + ")");
    await new Promise(resolve => setTimeout(resolve, 1000));
    const data = await fdownloader.getMedia(url);
    video_url = data?.url;
    status = data?.status;
    maxAttempts--;
  }
  return new JsonResponse({ video_url, short_url, status });
});

router.get("/dc/tiktok-video-scrapper?", async (req, env) => {
  const { query } = req;
  const url = decodeURIComponent(query.url);
  let count = 0;
  let maxTries = 3;
  if (url.includes("tiktok.com/")) {
    console.log("es link de tiktok");
    const scrap = async () => {
      const response = await fetch(`https://tikwm.com/api/?url=${url}`);
      const data = await response.json();
      const caption = (data.data?.title).trim().replace(/\s+$/, "");
      const json_response = {
        video_url: data?.data?.play,
        short_url: "https://m.tiktok.com/v/"+ data.data.id,
        caption: caption,
        status: 200
      };
      return JSON.stringify(json_response);
    };
    const retryScrap = async () => {
      try {
        return await scrap();
      } catch (error) {
        console.log(error);
        if (count < maxTries) {
          count++;
          return await retryScrap();
        } else {
          const json_error = {status: 429};
          return JSON.stringify(json_error);
        }
      }
    };
    return new JsResponse(await retryScrap());
  } else {
    console.log("no es link de tiktok");
    return new JsResponse("Url no válida");
  }
});

router.get("/dc/twitter-video-scrapper?", async (req, env) => {
  const { query } = req;
  const url = decodeURIComponent(query.url);
  const graphql = "https://twitter.com/i/api/graphql/xOhkmRac04YFZmOzU9PJHg";
  if (url.includes("twitter.com/") || url.includes("x.com/")) {
    const _userAgent = randUA("desktop");
    console.log("es link de twitter");
    const id = obtenerIDDesdeURL(url);
    const tweetQuery = `TweetDetail?variables={"focalTweetId":"${id}","with_rux_injections":false,"includePromotedContent":true,"withCommunity":true,"withQuickPromoteEligibilityTweetFields":true,"withBirdwatchNotes":true,"withVoice":true,"withV2Timeline":true}&features={"rweb_lists_timeline_redesign_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_media_download_video_enabled":false,"responsive_web_enhance_cards_enabled":false}&fieldToggles={"withArticleRichContentState":false}`;
    const eTweetQuery = encodeURI(tweetQuery);
    const fetchTweet = await fetch(`${graphql}/${eTweetQuery}`, {
      headers: {
        "cookie": env.x_cookie,
        "user-agent": _userAgent,
        ["sec-fetch-site"]: "same-origin",
        "Authorization": `Bearer ${env.twitter_bearer_token}`,
        "X-Twitter-Active-User": "yes",
        "X-Twitter-Auth-Type": "OAuth2Session",
        "X-Twitter-Client-Language": "en",
        "X-Csrf-Token": "0144e92ab3ad369187f2103484b8feec2d908204fdd66c97d891c468e07f7a57f2ced9f28b923d2e884f4854bf0d9b2accc07444d50a5d35b0e1afbb9bf563b926e5310e13dd28a34c098d6e3169a402"
      }
    });
    const result = await fetchTweet.json();
    const entries = () => {
      const entries = [];
      result.data?.threaded_conversation_with_injections_v2?.instructions[0]?.entries?.forEach((en) => {
        if (en?.entryId === `tweet-${id}`) {
          entries.push(en?.content?.itemContent?.tweet_results?.result?.legacy);
        }
      });
      return entries[0];
    };
    const data = entries();
    console.log(data);
    if (data?.extended_entities?.media[0]?.video_info) {
      const videos = data.extended_entities.media[0].video_info.variants;
      const short_url = data.extended_entities.media[0].url;
      const caption = data.full_text.replace(/https:\/\/t\.co\/\w+/g, "").trim();
      console.log(videos);
      let maxBitrate = 0;
      let video_url = "";
      for (const video of videos) {
        if (video.content_type === "video/mp4" && video.bitrate && video.bitrate > maxBitrate && video.url.includes("avc1")) {
          maxBitrate = video.bitrate;
          video_url = video.url;
        }
      }
      console.log(video_url);
      const json_response = {
        video_url: video_url,
        short_url: short_url,
        caption: caption,
        status: 200
      };
      return new JsonResponse(json_response);
    } else {
      console.log("no es video");
      return new JsonResponse({ status: 404 });
    }
  } else {
    console.log("no es link de twitter");
    return new JsResponse("Url no válida");
  }
});

router.get("/dc/stable-diffusion?", async (req, env, ctx) => {
  const { query } = req;
  const key = env.stable_diffusion_token;
  const prompt = decodeURIComponent(query.prompt);
  let nsfw_checker = decodeURIComponent(query.nsfw_check);
  let extra_prompt;
  let extra_negative_prompt;
  if (nsfw_checker == "0") {
    nsfw_checker = "no";
    extra_prompt = "";
  } else {
    nsfw_checker = "yes";
    extra_prompt = ", highly detailed, f/1.4, ISO 200, 1/160s, 8K";
    extra_negative_prompt = ", (((NSFW))), ((unclothed))";
  }
  const openai = new OpenAI({
    apiKey: env.openai_token,
  });
  const IA = async() => {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Translate this words into 1. English\n${prompt.replace(/black/gi, "dark")}\n1. `,
      temperature: 0.6,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    return response.choices[0].text;
  };
  const translatedPrompt = await IA();

  const apiFetch = async () => {
    const apiUrl = "https://stablediffusionapi.com/api/v3/dreambooth";
    const options = {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        "key": key,
        "model_id": "anything-v5",
        "prompt": translatedPrompt.replace(/black/gi, "dark") + extra_prompt,
        "negative_prompt": "boring, bad art, (extra fingers), out of frame, mutated hands, poorly drawn hands, poorly drawn face, deformed, disfigured, ugly, blurry, bad anatomy, bad proportions, ((extra limbs)), cloned face, skinny, glitchy, (double torso), (double body), ((extra arms)), ((extra hands)), mangled fingers, missing lips, ugly face, distorted face, extra legs, watermark" + extra_negative_prompt,
        "width": "816",
        "height": "816",
        "samples": "1",
        "enhance_prompt": "no",
        "num_inference_steps": "30",
        "seed": null,
        "guidance_scale": "7.5",
        "safety_checker": "no",
        "multi_lingual": "yes",
        "webhook": null,
        "track_id": null
      })
    };
    const response = await fetch(apiUrl, options);
    const data = await response.json();
    console.log("Primer fetch");
    return await data;
  };

  const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const fetched = await apiFetch();
  const id = String(fetched.id);
  console.log(fetched);
  const comprobarFetch = async (fetched) => {
    if (fetched.status === "success" || fetched.status === "error") {
      if (fetched.status === "success") {
        const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
        const auth_list = (await env.AUTH_USERS.list()).keys;
        const imgur_user = "imgur_ahmedrangel";
        let imgur_url = (await Promise.all((auth_list.map(async(users_keys) => {
          if (imgur_user == users_keys.name) {
            const { access_token } = await imgur.RefreshToken(users_keys.metadata.value);
            const respuesta = await imgur.UploadImage(access_token, prompt, fetched.output[0], "Stable Diffusion: Anything-v5");
            const imgurl = respuesta.data.link;
            console.log(imgurl);
            return imgurl;
          }
        })))).filter(users_keys => users_keys);
        console.log("subido a imgur");
        return {output: [imgur_url]};
      } else {
        console.log("error");
        return {output: ["error"]};
      }
    } else {
      console.log("refetcheando");
      await delay(2000);
      const apiUrl = `https://stablediffusionapi.com/api/v3/dreambooth/fetch/${id}`;
      const options = {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        body: JSON.stringify({
          "key": key,
          "request_id": id
        }),
        redirect: "follow"
      };
      const response = await fetch(apiUrl, options);
      const data = await response.json();
      console.log(data);
      return await comprobarFetch(data);
    }
  };
  const response = await comprobarFetch(fetched);
  return new JsResponse(response.output[0]);
});

// Nightbot command: Followage
router.get("/followage/:channel/:touser?", async (req, env) => {
  const { channel, touser } = req.params;
  const { moderator_id } = req.query;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const channel_id = await twitch.getId(channel);
  const access_id = moderator_id ? moderator_id : channel_id;
  const auth = await env.AUTH_USERS.get(access_id);
  console.log(auth);
  if (auth) {
    const touser_id = await twitch.getId(touser);
    if (!touser_id)
      return new JsResponse("El usuario que has mencionado no existe. FallHalp");
    const access_token = await twitch.RefreshToken(auth);
    const data = await twitch.getChannelFollower(access_token, channel_id, touser_id);
    if (data?.followed_at) {
      const unitsString = getTimeUnitsFromISODate(data?.followed_at);
      return new JsResponse(`@${touser} ha estado siguiendo a ${channel} por ${unitsString}`);
    } else if (data?.message) {
      return new JsResponse(`El usuario con id: ${moderator_id} no es moderador. Verifique el id o asegure que ya esté autorizado: ${env.WORKER_URL}/twitch/auth?scopes=moderator:read:followers`);
    }

    return new JsResponse(`@${touser} no está siguiendo a ${channel}`);
  } else if (!auth && moderator_id) {
    return new JsResponse(`El usuario con id: ${moderator_id} no está autorizado. Verifique el id o asegure que ya esté autorizado: ${env.WORKER_URL}/twitch/auth?scopes=moderator:read:followers`);
  }
  return new JsResponse(`Es necesario que ${moderator_id ? "el moderador" : "el streamer"} inicie sesión en este enlace: ${env.WORKER_URL}/twitch/auth?scopes=moderator:read:followers`);
});

// Lol Champion Masteries (with Riot ID)
router.get("/lol/masteries/:region/:name/:tag", async (req, env) => {
  const { name, tag } = req.params;
  const region = (req.params.region).toLowerCase();
  const riot = new riotApi(env.riot_token);
  const route = riot.RegionNameRouting(region);
  if (!route) {
    return new JsonResponse({status_code: 404, errorName: "region"});
  }
  const cluster = riot.RegionalRouting(region);
  const account = await riot.getAccountByRiotID(name, tag, cluster);
  const puuid = account.puuid;
  const summoner = await riot.getSummonerDataByPUUID(puuid, route);
  if (account?.status || summoner?.status) {
    return new JsonResponse({status_code: 404, errorName: "riotId"});
  }
  const ddversions = await fetch(`https://ddragon.leagueoflegends.com/realms/${region}.json`);
  const ddversions_data = await ddversions.json();
  const champion_list = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.champion}/data/es_MX/champion.json`);
  const champion_data = await champion_list.json();
  const icon = `https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.profileicon}/img/profileicon/${summoner.profileIconId}.png`;
  const masteriesData = await riot.getChampionMasteriesByPUUID(puuid, route, 10);
  if (masteriesData?.status) {
    return new JsonResponse({status_code: 404, errorName: "mastery"});
  }
  const masteryScore = await riot.getChampionMasteryScoreByPUUID(puuid, route);
  const data = {
    riotName: account.gameName,
    riotTag: account.tagLine,
    region: region,
    profileIconUrl: icon,
    score: masteryScore,
    status_code: 200
  };
  const masteries = [];
  masteriesData.forEach(m => {
    const championName = String(jp.query(champion_data.data, `$..[?(@.key==${m.championId})].name`));
    const usadoHace = getDateAgoFromTimeStamp(m.lastPlayTime);
    masteries.push({
      level: m.championLevel,
      points: m.championPoints,
      chestGranted: m.chestGranted,
      championId: m.championId,
      championName: championName,
      usadoHace: usadoHace
    });
  });
  data.masteries = masteries;
  return new JsonResponse(data);
});

router.get("/dc/twitch-video-scrapper?", async (req, env) => {
  const { query } = req;
  const url = decodeURIComponent(query.url);
  const id = obtenerIDDesdeURL(url);
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const obj = {};
  try {
    const data = await twitch.getClips(id);
    const thumbnailUrl = data?.thumbnail_url;
    const videoUrl = thumbnailUrl.replace(/-preview-.*\.jpg/, ".mp4");
    const clipUrl = data?.url;
    const title = data?.title;
    const channel = data?.broadcaster_name;
    obj.video_url = videoUrl;
    obj.short_url = clipUrl;
    obj.caption = title;
    obj.status = 200;
  } catch (e) {
    obj.status = 404;
  }
  return new JsonResponse(obj);
});

router.get("/kick/clip/:id", async (req, env) => {
  const { id } = req.params;
  const tokens = [env.crossclip_token, env.crossclip_token2];
  const random_token = tokens[Math.floor(Math.random() * tokens.length)];
  const crossclip = new crossclipApi(random_token);
  let url = await crossclip.getKickClip(id);
  let maxAttempts = 4;
  console.log(id);
  while (!url && maxAttempts > 0) {
    console.log("Retrying video download (attempt " + (5 - maxAttempts) + ")");
    await new Promise(r => setTimeout(r, 7000));
    url = await crossclip.getKickClip(id);
    maxAttempts--;
  }
  if (url) console.log("Downloaded");
  return new JsonResponse({ url });
});

router.get("/lol/elo?", async (req, env) => {
  const { query } = req;
  const riot = new riotApi(env.riot_token);
  const default_riot = decodeURIComponent(query.default).split("-");
  let soloq;
  let flex;
  if (!query.query) {
    const riotName = default_riot[0].replace(/ /g, "");
    const riotTag = default_riot[1];
    const region = default_riot[2].toLowerCase();
    const cluster = riot.RegionalRouting(region);
    const route = riot.RegionNameRouting(region);
    const { puuid, gameName, tagLine } = await riot.getAccountByRiotID(riotName, riotTag, cluster);
    if (!puuid) return new JsResponse("Usuario no encontrado. Asegúrate de escribir correctamente el comando con el siguiente formato:  !elo <Nombre#Tag> <Región>");
    const { id } = await riot.getSummonerDataByPUUID(puuid, route);
    if (!id) return new JsResponse("Usuario no encontrado.");
    const leagueData = await riot.RankedData(id, route);
    for (const d of leagueData) {
      if (d.queueType === "RANKED_SOLO_5x5") {
        const tier = riot.tierCase(d.tier).full;
        const rank = d.tier === "GRANDMASTER" || d.tier === "CHALLENGER" || d.tier === "MASTER" ? "" : d.rank;
        const winrate = Math.round((d.wins/(d.wins + d.losses))*100);
        soloq = `SoloQ: ${tier} ${rank} · ${d.leaguePoints} LP · ${d.wins}V ${d.losses}D (${winrate}% WR)`;
      } else if (d.queueType === "RANKED_FLEX_SR") {
        const tier = riot.tierCase(d.tier).full;
        const rank = d.tier === "GRANDMASTER" || d.tier === "CHALLENGER" || d.tier === "MASTER" ? "" : d.rank;
        const winrate = Math.round((d.wins/(d.wins + d.losses))*100);
        flex = `Flex: ${tier} ${rank} · ${d.leaguePoints} LP · ${d.wins}V ${d.losses}D (${winrate}% WR)`;
      }
    }
    return new JsResponse(`${gameName} #${tagLine} ${soloq ? `| ${soloq}` : ""} ${flex ? `| ${flex}` : ""}`);
  }
  const query_full = decodeURIComponent(query.query);
  const regex = /^(.*?)#(.*?)\s(.*?)$/;
  const matches = regex.exec(query_full);
  if (!matches) return new JsResponse("Asegúrate de escribir correctamente el comando con el siguiente formato:  !elo <Nombre#Tag> <Región>");
  const riotName = matches[1];
  const riotTag = matches[2];
  const region = matches[3].toLowerCase();
  console.log(riotName, riotTag, region);
  const cluster = riot.RegionalRouting(region);
  const route = riot.RegionNameRouting(region);
  const { puuid, gameName, tagLine } = await riot.getAccountByRiotID(riotName, riotTag, cluster);
  if (!puuid) return new JsResponse("Usuario no encontrado. Asegúrate de escribir correctamente el comando con el siguiente formato:  !elo <Nombre#Tag> <Región>");
  const { id } = await riot.getSummonerDataByPUUID(puuid, route);
  if (!id) return new JsResponse("Usuario no encontrado.");
  const leagueData = await riot.RankedData(id, route);
  for (const d of leagueData) {
    if (d.queueType === "RANKED_SOLO_5x5") {
      const tier = riot.tierCase(d.tier).full;
      const rank = d.tier === "GRANDMASTER" || d.tier === "CHALLENGER" || d.tier === "MASTER" ? "" : d.rank;
      const winrate = Math.round((d.wins/(d.wins + d.losses))*100);
      soloq = `SoloQ: ${tier} ${rank} · ${d.leaguePoints} LP · ${d.wins}V ${d.losses}D (${winrate}% WR)`;
    } else if (d.queueType === "RANKED_FLEX_SR") {
      const tier = riot.tierCase(d.tier).full;
      const rank = d.tier === "GRANDMASTER" || d.tier === "CHALLENGER" || d.tier === "MASTER" ? "" : d.rank;
      const winrate = Math.round((d.wins/(d.wins + d.losses))*100);
      flex = `Flex: ${tier} ${rank} · ${d.leaguePoints} LP · ${d.wins}V ${d.losses}D (${winrate}% WR)`;
    }
  }
  return new JsResponse(`${gameName} #${tagLine} ${soloq ? `| ${soloq}` : ""} ${flex ? `| ${flex}` : ""}`);
});

router.all("*", () => new JsResponse("Not Found.", { status: 404 }));

export default {
  async fetch(req, env, ctx) {
    return router.fetch(req, env, ctx);
  },
  async scheduled(event, env, ctx) {
    switch (event.cron) {
    case "*/3 * * * *":
      await lolChampTagAdder(env);
      break;
    }
  }
};
