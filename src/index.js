import { IttyRouter } from "itty-router";
import { generateUniqueId, getDateAgoFromTimeStamp, getRandom, obtenerIDDesdeURL, obtenerDiscordUserIdFromAvatarsCdn, getTimeUnitsFromISODate, KVSorterByValue, jsonCustomSorterByProperty, SettedTwitchTagsResponse, timeToSeconds, socialsCache, mimeType } from "./utils/helpers";
import twitchApi from "./apis/twitchApi";
import JsResponse from "./responses/response";
import JsonResponse from "./responses/jsonResponse";
import { OpenAI } from "openai";
import spotifyApi from "./apis/spotifyApi";
import riotApi, { eloValues } from "./apis/riotApi";
import imgurApi from "./apis/imgurApi";
import jp from "jsonpath";
import { lolChampTagAdder } from "./crons/lolChampTagAdder";
import { nbCum, nbFuck, nbFuckAngar, nbHug, nbHugAngar, nbKiss, nbKissAngar, nbKissChino } from "./utils/nightbotEmotes";
import youtubeApi from "./apis/youtubeApi";
import { randUA } from "@ahmedrangel/rand-user-agent";
import igApi from "./apis/igApi";
import mp3youtubeApi from "./apis/mp3youtubeApi";
import y2mateApi from "./apis/y2mateApi";
import crossclipApi from "./apis/crossclipApi";
import fdownloaderApi from "./apis/fdownloaderApi";
import { load } from "cheerio";
import twitterApi from "./apis/twitterApi";
import tiktokApi from "./apis/tiktokApi";
import kickApi from "./apis/kickApi";
import { $fetch } from "ofetch";
import CustomResponse from "./responses/customResponse";
import { withQuery } from "ufo";
import ErrorResponse from "./responses/ErrorResponse";
import { Error } from "./utils/errors";
import twitchGQL from "./apis/twitchGQL";
import redditApi from "./apis/redditApi";

const router = IttyRouter();
// educar
router.get("/educar/:user/:channel/:touser", async (req, env) => {
  const percent = getRandom({ max: 100 });
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
      await env.EDUCAR.put(key, counter, { metadata: { value: counter } });
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

// fuck v2 kick
router.get("/kick/fuck/:user/:channel", async (req, env) => {
  const { user, channel } = req.params;
  const { touser } = req.query;
  const user_lc = user.toLowerCase();
  const channel_lc = channel.toLowerCase();
  const touser_lc = touser.toLowerCase();

  if (!touser) return new JsResponse("Error. Debes etiquetar con arroba (@) a alguien.");
  const percent = getRandom({ max: 100 });
  const select = await env.KB.prepare(`SELECT count FROM fuck WHERE user = '${touser_lc}' AND channel = '${channel_lc}'`).first();
  if (user_lc === touser_lc) {
    return new JsonResponse(`@${user} -> Cómo? estás intentando follarte a ti mismo?`);
  } else if (percent < 40) {
    const count = select?.count;
    const counter = count ? count + 1 : 1;
    if (!select) {
      await env.KB.prepare(`INSERT INTO fuck (user, channel) VALUES ('${touser_lc}', '${channel_lc}')`).first();
    } else {
      await env.KB.prepare(`UPDATE fuck SET count = '${counter}', user = '${touser_lc}' WHERE user = '${touser_lc}' AND channel = '${channel_lc}'`).first();
    }
    const veces = counter === 1 ? "vez" : "veces";
    const emote = nbFuck[Math.floor(Math.random()*nbFuck.length)];
    return new JsonResponse(`@${user} -> Le has dado una follada a @${touser} . Ha sido follado ${counter} ${veces} en total.`);
  } else {
    return new JsonResponse(`@${user} -> @${touser} Se ha logrado escapar. Quizás la proxima vez.`);
  }
});

// fuck
router.get("/fuck/:user/:channelID/:touser", async (req, env) => {
  const { user, touser } = req.params;
  const channelId = req.params.channelID;
  const percent = getRandom({ max: 100 });
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
  const percent = getRandom({ max: 100 });
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
  const percent = getRandom({ max: 100 });
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
  const percent = getRandom({ max: 100 });
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
    let responses_arr = ["en la cara", "en la espalda", "en el pecho", "en las manos", "en los pies", "en las tetas", "en la boca"];
    let lugar = responses_arr[Math.floor(Math.random()*responses_arr.length)];
    if (id_channel == id_angar) {
      let emotes_arr = ["angarMonkas", "angarRico", "angarGasm"];
      let emote = emotes_arr[Math.floor(Math.random()*emotes_arr.length)];
      if (percent < 40) {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, { metadata: { value: counter } });
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. angarL Te han cumeado ${counter} ${veces} en total. `;
        } else {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, { metadata: { value: counter } });
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user} cumeó ${lugar} de ${touser}. Han cumeado a ${touser} ${counter} ${veces} en total. ${emote}`;
        }
      } else {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, { metadata: { value: counter } });
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. Te han cumeado ${counter} ${veces} en total. angarL Si quieres cumear a alguien más debes mencionarlo`;
        } else {
          mensaje = `${user}, has disparado tu cum pero cayó en el suelo. Apunta mejor la próxima vez. BloodTrail`;
        }
      }
    } else {
      let emotes_arr = ["Kreygasm", "angarRico", "PogChamp"];
      let emote = emotes_arr[Math.floor(Math.random()*emotes_arr.length)];
      if (percent < 40) {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, { metadata: { value: counter } });
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user}, Has cumeado en ti mismo. Te han cumeado ${counter} ${veces} en total. LUL`;
        } else {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, { metadata: { value: counter } });
          const veces = counter === 1 ? "vez" : "veces";
          mensaje = `${user} cumeó ${lugar} de ${touser}. Han cumeado a ${touser} ${counter} ${veces} en total. ${emote}`;
        }
      } else {
        if (id_user == id_touser) {
          counter = counter ? counter + 1 : 1;
          await env.CUM.put(key, counter, { metadata: { value: counter } });
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
    let emotes_arr = ["angarRico", "Kreygasm", "Jebaited", "TakeNRG"];
    let emote = emotes_arr[Math.floor(Math.random()*emotes_arr.length)];
    let responses_arr = ["le has dado una nalgada", "le has marcado sus manos en las nalgas", "le has cacheteado la nalga derecha", "le has cacheteado la nalga izquierda", "le has dado una nalgada con sus dos manos"];
    let accion = responses_arr[Math.floor(Math.random()*responses_arr.length)];
    if (id_user == id_touser) {
      counter = counter ? counter + 1 : 1;
      const veces = counter === 1 ? "nalgada" : "nalgadas";
      await env.SPANK.put(key, counter, { metadata: { value: counter } });
      mensaje = `@${user} -> Te has pegado una nalgada a ti mismo ${emote}. Has recibido ${counter} ${veces} en total.`;
    } else {
      counter = counter ? counter + 1 : 1;
      await env.SPANK.put(key, counter, { metadata: { value: counter } });
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

  let top_users_limited_array = top_users_json.slice(0, limit);

  let top_users = (await Promise.all((top_users_limited_array.map(async (top_users_limited_array) => {
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

  let top_users_limited_array = top_users_json.slice(0, limit);

  let top_users = (await Promise.all((top_users_limited_array.map(async (top_users_limited_array) => {
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
    lists: lists
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
    let response = (await Promise.all((auth_list.map(async (users_keys) => {
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
    apiKey: env.openai_token
  });
  const response = await openai.completions.create({
    model: "gpt-3.5-turbo-instruct",
    prompt: `${user}: ${decodeURIComponent(prompt)}\nGemi:`,
    temperature: 0.7,
    max_tokens: 110,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  });
  return new JsResponse(`${response.choices[0].text.replaceAll("\n", " ")}`);
});

// Openai GPT-3.5-turbo-instruct Translator AI  with Language detection
router.get("/ai/translate/:prompt", async (req, env) => {
  const { prompt } = req.params;
  const openai = new OpenAI({ apiKey: env.openai_token });
  const detectlanguage_url = "https://ws.detectlanguage.com/0.2/detect";
  const detect = await fetch(detectlanguage_url, {
    method: "POST",
    body: JSON.stringify({ q: decodeURIComponent(prompt) }),
    headers: {
      "Authorization": "Bearer " + env.detectlanguage_token,
      "Content-Type": "application/json"
    }
  });
  const { data } = await detect.json();
  const IA = async (to_language) => {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Translate this into 1. ${to_language}\n${decodeURIComponent(prompt)}\n1.`,
      temperature: 0.3,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
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
  try {
    const prompt = decodeURIComponent(req.params.prompt);
    const user = decodeURIComponent(req.params.user);
    const botName = "Gemi-Chan";
    const openai = new OpenAI({ apiKey: env.openai_token });
    let context = "";
    const history = await env.R2gpt.get("history.json");
    const historyJson = await history?.json() || [];
    if (historyJson && historyJson.length) {
      historyJson.length > 2 ? historyJson.shift() : null;
      for (const h of historyJson) {
        context = context + `${h.name}:${h.message}\n`;
      }
    }
    const contextPlusPrompt = `${context}${user}:${prompt}\n${botName}:`;
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: contextPlusPrompt,
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    });
    const completion = (String.raw`${(response.choices[0].text)}`).replaceAll(/\\/g, "\\\\");
    historyJson.push(
      { name: user, message: prompt },
      { name: botName, message: completion }
    );
    // Put R2
    const httpHeaders = { "Content-Type": "application/json; charset=utf-8" };
    const headers = new Headers(httpHeaders);
    await env.R2gpt.put("history.json", JSON.stringify(historyJson), { httpMetadata: headers });
    return new JsonResponse({ status: 200, message: response.choices[0].text });
  } catch (e) {
    console.log(e);
    return new ErrorResponse(Error.BAD_REQUEST);
  }
});

router.get("/dc/image-generation/:prompt", async (req, env) => {
  let { prompt } = req.params;
  prompt = decodeURIComponent(prompt);
  let image_url = "";
  try {
    const openai = new OpenAI({ apiKey: env.openai_token });
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json"
    });

    let openai_b64 = response.data[0].b64_json;
    const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
    const auth_list = (await env.AUTH_USERS.list()).keys;
    const imgur_user = "imgur_ahmedrangel";
    let imgur_url = (await Promise.all((auth_list.map(async (users_keys) => {
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
  let blob;
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
    const cloudinary_response = await $fetch(cloudinary_api, {
      method: "POST",
      body: fdCloudinary
    }).catch(() => null);
    cloudinary_url = cloudinary_response.secure_url;
    blob = await $fetch(cloudinary_url).catch(() => null);
  } else {
    console.log("es PNG");
    const cloudinary_response = await $fetch(cloudinary_api, {
      method: "POST",
      body: fdCloudinary
    }).catch(() => null);
    cloudinary_url = cloudinary_response.secure_url;
    blob = await $fetch(cloudinary_url, { responseType: "blob" }).catch(() => null);
  }
  try {
    const formData = new FormData();
    formData.append("image", blob, "image.png");
    formData.append("n", "1");
    formData.append("size", "1024x1024");
    formData.append("response_format", "b64_json");
    const variation_fetch = "https://api.openai.com/v1/images/variations";
    const response = await $fetch(variation_fetch, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openai_token}`
      },
      body: formData
    }).catch(() => null);
    let openai_b64 = response.data[0].b64_json;
    const imgur = new imgurApi(env.imgur_client_id, env.imgur_client_secret);
    const auth_list = (await env.AUTH_USERS.list()).keys;
    const imgur_user = "imgur_ahmedrangel";
    let imgur_url = (await Promise.all((auth_list.map(async (users_keys) => {
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
  return new JsonResponse({ original: cloudinary_url, variation: String(image_url) });
});

// Twitch Auth that redirect to oauth callback to save authenticated users
router.get("/twitch/auth", async (req, env) => {
  const { scopes } = req.query;
  const allScopes = "user:read:email bits:read channel:manage:broadcast channel:read:subscriptions channel:manage:moderators moderator:read:chatters moderator:manage:shoutouts moderator:read:followers user:read:follows moderation:read moderator:manage:banned_users channel:manage:vips";
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
    await env.AUTH_USERS.put(key, refresh_token, { metadata: { value: refresh_token } });
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
  for (let i = 0; i < auth_list.length; i++) {
    let user_key = auth_list[i].name;
    if (channelID == user_key) {
      const access_token = await twitch.RefreshToken(auth_list[i].metadata.value);
      const data = await twitch.getBitsLeaderBoard(access_token);
      if (page == 1) {
        for (let i = 0; i < 5; i++) {
          msg = msg + insert(`${data[i].rank})${data[i].user_name}${data[i].score} bits `, String(data[i].rank).length + String(data[i].user_name).length + 1, dots.repeat(42 - (String(data[i].rank).length + String(data[i].user_name).length + String(data[i].score).length + 3)));
          response = `Top bits totales del 1 al 5 ${break_line} ${msg} ${break_line}`;
        }
      } else if (page == 2) {
        for (let i = 5; i < 10; i++) {
          msg = msg + insert(`${data[i].rank})${data[i].user_name}${data[i].score} bits `, String(data[i].rank).length + String(data[i].user_name).length + 1, dots.repeat(42 - (String(data[i].rank).length + String(data[i].user_name).length + String(data[i].score).length + 3)));
          response = `Top bits totales del 6 al 10 ${break_line} ${msg} ${break_line}`;
        }
      } else if (page == 3) {
        for (let i = 10; i < 15; i++) {
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
  query_tags = query_tags.replaceAll(" ", "").replace("tags:", "").split(",");
  let tags_length = query_tags.length;
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  if (query == "tags:") {
    let actualtags = await twitch.getBroadcasterInfo(channelID);
    const response = `Etiquetas actuales: ${String(actualtags.tags).replaceAll(/,/g, ", ")}`;
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
    response = (await Promise.all((auth_list.map(async (users_keys) => {
      if (channel_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        console.log(touser);
        const to_user = await twitch.getId(touser);
        const add_mod = await twitch.AddMod(access_token, users_keys.name, to_user);
        if (add_mod.status === 400 && to_user !== false) {
          console.log(add_mod);
          return "Error al intentar agregar como moderador.";
        } else if (add_mod.status === 422) {
          return "Error. Este usuario es VIP. Para convertirlo en moderador primero debe remover el VIP.";
        } else if (to_user === false) {
          return "Error. Usuario no encontrado.";
        } else if (add_mod.status === 204) {
          return `El usuario: @${touser}, ha obtenido privilegios de moderador.`;
        } else {
          return "Error al intentar agregar como moderador.";
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
    response = (await Promise.all((auth_list.map(async (users_keys) => {
      if (channel_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        console.log(touser);
        const to_user = await twitch.getId(touser);
        const unmod = await twitch.UnMod(access_token, users_keys.name, to_user);
        if (unmod.status === 400 && to_user !== false) {
          return "Error. Este usuario no es moderador";
        } else if (to_user === false) {
          return "Error. Usuario no encontrado.";
        } else if (unmod.status === 204) {
          return `El usuario: @${touser}, ha dejado de ser moderador`;
        } else {
          return "Error al intentar remover como moderador.";
        }
      }
    })))).filter(users_keys => users_keys);
    console.log (response);
  } else {
    response = "No tienes permiso para realizar esta acción.";
  }
  return new JsResponse(response);
});

// Nightbot command: Add Vip
router.get("/addvip/:user_id/:channel_id/:touser", async (req, env) => {
  const { user_id, channel_id, touser } = req.params;
  const ahmed = "71492353";
  let response = "";
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  if (user_id == ahmed || user_id == channel_id) {
    const auth_list = (await env.AUTH_USERS.list()).keys;
    response = (await Promise.all((auth_list.map(async (users_keys) => {
      if (channel_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        console.log(touser);
        const to_user = await twitch.getId(touser);
        const add_vip = await twitch.AddVip(access_token, users_keys.name, to_user);
        if (add_vip.status === 400 && to_user !== false) {
          console.log(add_vip);
          return "Error al intentar agregar como VIP";
        } else if (add_vip.status === 422) {
          return "Error al intentar agregar como VIP . Este usuario ya es VIP o es Moderador.";
        } else if (add_vip.status === 409) {
          return "Error. Este canal no tiene slots de VIP disponibles.";
        } else if (to_user === false) {
          return "Error. Usuario no encontrado.";
        } else {
          return `El usuario: @${touser}, ha obtenido VIP`;
        }
      }
    })))).filter(users_keys => users_keys);
    console.log (response);
  } else {
    response = "No tienes permiso para realizar esta acción.";
  }
  return new JsResponse(response);
});

// Nightbot command: Remove Vip
router.get("/unvip/:user_id/:channel_id/:touser", async (req, env) => {
  const { user_id, channel_id, touser } = req.params;
  const ahmed = "71492353";
  let response = "";
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  if (user_id == ahmed || user_id == channel_id) {
    const auth_list = (await env.AUTH_USERS.list()).keys;
    response = (await Promise.all((auth_list.map(async (users_keys) => {
      if (channel_id == users_keys.name) {
        const access_token = await twitch.RefreshToken(users_keys.metadata.value);
        console.log(touser);
        const to_user = await twitch.getId(touser);
        const unvip = await twitch.UnVip(access_token, users_keys.name, to_user);
        if (unvip.status === 422 && to_user !== false) {
          return "Error. Este usuario no es VIP";
        } else if (to_user === false) {
          return "Error. Usuario no encontrado.";
        } else if (unvip.status === 204) {
          return `El usuario: @${touser}, ha dejado de ser VIP`;
        } else {
          return "Error al intentar remover VIP";
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
  const { user, channel, channel_id, touser } = req.params;
  if (user.toLowerCase() === touser.toLowerCase()) {
    return new JsResponse(`@${user} -> No puedes hacer shoutout a ti mismo.`);
  }
  const twitch = new twitchApi(env.client_id, env.client_secret, env.NB);
  const auth_list = (await env.AUTH_USERS.list()).keys;
  const response = (await Promise.all((auth_list.map(async (users_keys) => {
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
    await env.AUTH_USERS.put(key, refresh_token, { metadata: { value: refresh_token } });
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
      let response = (await Promise.all((auth_list.map(async (users_keys) => {
        if ("spotify_21bzdcprfxsmlthwssmrnr2si" == users_keys.name) {
          const spotify = new spotifyApi(env.spotify_client_id, env.spotify_client_secret);
          const access_token = await spotify.RefreshToken(users_keys.metadata.value);
          const data = await spotify.GetCurrentlyPlayingTrack(access_token);
          const { item } = await data.json();
          const { artists } = item;
          const { name } = item;
          const { external_urls } = item;
          const track_url = external_urls.spotify;
          let artists_names = artists.map(artists => {
            let names = artists.name;
            return names;
          }).filter(artists => artists);
          const track = artists_names.toString().replaceAll(",", ", ") + " - " + name + " " + track_url;
          return track;
        }
      })))).filter(users_keys => users_keys);
      return new JsResponse(`La canción que ${channel} está escuchando en Spotify ahora mismo es: ${break_line} ${response}`);
    }
  } catch (e) {
    return new JsResponse(`${channel} no está reproduciendo música en Spotify actualemnte.`);
  }
});

router.get("/put/discord-avatars?", async (req, env) => {
  const url = req.query.url;
  const id = obtenerIDDesdeURL(url);
  const userId = obtenerDiscordUserIdFromAvatarsCdn(url);
  const data = await fetch(url);
  const blob = await data.blob();
  const object = await env.R2cdn.put(`discord-avatars/${userId}/${id}`, blob);
  return new JsResponse(JSON.stringify(object));
});

router.put("/cdn", async (req, env, ctx) => {
  const cdnAuth = req.headers.get("x-cdn-auth");
  if (cdnAuth !== env.CDN_TOKEN) return new ErrorResponse(Error.UNAUTHORIZED, { message: "Unauthorized" });
  const contentType = req.headers.get("Content-Type");
  const isFormData = contentType.includes("multipart/form-data");
  const obj = isFormData ? await req.formData() : await req.json();
  const file = isFormData ? obj.get("file") : null;
  const source = obj.source;
  const prefix = !isFormData ? obj.prefix : obj.get("prefix");
  const file_name = !isFormData ? obj.file_name : file.name;
  const httpMetadata = !isFormData ? obj.httpMetadata : JSON.parse(obj.get("httpMetadata"));

  if (!source && !file) return new ErrorResponse(Error.BAD_REQUEST, { message: "Missing required fields" });

  const cdn = "https://cdn.ahmedrangel.com";
  const b = source ? await $fetch(source, { responseType: "blob" }, { headers: { "User-Agent": randUA("desktop") } }) : file;
  const path = prefix && file_name || prefix ? `${prefix}/${file_name}` : `${file_name}`;

  await env.R2cdn.put(path, b, { httpMetadata: new Headers(httpMetadata) });
  console.log(`escrito: ${path}`);
  return new JsonResponse({ url: `${cdn}/${path}` });
});

router.get("/lol/live?", async (req, env) => {
  const { query } = req;
  const riot = new riotApi(env.riot_token);
  const default_riot = decodeURIComponent(query.default).split("-");
  const roles = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
  let data = [];
  let team1String = [], team1 = [];
  let team2String = [], team2 = [];
  let tier = "";
  let rank = "";
  let division = "";
  let lp = "";
  let dots = "_";
  const break_line = "─────────────────────────";
  // Decode al query, reemplaza espacios por (-), elimina caracteres especiales
  let query_string = decodeURIComponent(query.query).replaceAll(/ /g, "-").replaceAll(/[^a-zA-Z0-9\-]/g, "", "");
  query_string = query_string.replace(/-+$/, ""); // elimina el overflow de guiones al final de la cadena
  // Si el query no está vacío se separa el usuario y la región, de lo contrario se usa el usuario y region definido.
  if (!query.query) {
    const riotName = default_riot[0].replace(/ /g, "");
    const riotTag = default_riot[1];
    const region = default_riot[2].toLowerCase();
    return new JsResponse(await responseBuild(riotName, riotTag, region));
  }
  const query_full = decodeURIComponent(query.query);
  const regex = /^(.*?)#(.*?)\s(.*?)$/;
  const matches = regex.exec(query_full);
  if (!matches) return new JsResponse("Asegúrate de escribir correctamente el comando con el siguiente formato:  !elo <Nombre#Tag> <Región>");
  const riotName = matches[1];
  const riotTag = matches[2];
  const region = matches[3].toLowerCase();
  return new JsResponse(await responseBuild(riotName, riotTag, region));

  async function responseBuild (riotName, riotTag, region) {
    const cluster = riot.RegionalRouting(region);
    const route = riot.RegionNameRouting(region);
    const { puuid, gameName, tagLine } = await riot.getAccountByRiotID(riotName, riotTag, cluster);
    if (!puuid) return new JsResponse("Usuario no encontrado. Asegúrate de escribir correctamente el comando con el siguiente formato:  !elo <Nombre#Tag> <Región>");
    const ddversions = await fetch(`https://ddragon.leagueoflegends.com/realms/${region}.json`);
    const ddversions_data = await ddversions.json();
    const champion_list = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.champion}/data/es_MX/champion.json`);
    const champion_data = await champion_list.json();
    const live_game_data = await riot.LiveGameData(puuid, route);
    const game_type = riot.queueCase(live_game_data.gameQueueConfigId);
    if (live_game_data.participants) {
      const participants = live_game_data.participants;
      const team_size = participants.length;
      for (let i = 0; i < team_size; i++) {
        if (participants[i].teamId == 100) {
          const blue_team = "🔵";
          await AdjustParticipants(participants[i], team1, game_type.profile_rank_type, blue_team, champion_data, route);
        } else if (participants[i].teamId == 200) {
          const red_team = "🔴";
          await AdjustParticipants(participants[i], team2, game_type.profile_rank_type, red_team, champion_data, route);
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

      team1.forEach(t => {
        team2String.push(`${t.teamColor}${t.riotId}(${t.championName})${t.dots}${t.division}${t.lp}`);
      });
      team2.forEach(t => {
        team2String.push(`${t.teamColor}${t.riotId}(${t.championName})${t.dots}${t.division}${t.lp}`);
      });

      return String((`${game_type.queue_name} ${break_line} ${String(team1String)} ${String(team2String)}`).replaceAll(",", " "));
    }
    return `${gameName} #${tagLine} no se encuentra en partida ahora mismo. FallHalp `;
  }

  async function AdjustParticipants (participants, team, game_type, team_color, champion_data, route) {
    participants.championName = (String(jp.query(champion_data.data, `$..[?(@.key==${participants.championId})].name`)));
    let riotId = participants.riotId;
    const ranked_data = await riot.RankedData(participants.summonerId, route);
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
    let names_size = (46 - (String(participants.championName).length + String(participants.riotId).length + 14));
    let teamObj = {
      teamColor: team_color,
      riotId: riotId.replaceAll(" ", "").replace(/#.+$/, ""),
      championName: participants.championName.replaceAll(" ", ""),
      championId: participants.championId,
      spell1Id: participants.spell1Id,
      spell2Id: participants.spell2Id,
      division: division,
      lp: lp
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
  }

  return new JsResponse(data);
});

router.get("/lol/spectator/:region/:name/:tag", async (req, env) => {
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
  const participantsHandler = async (p, merakiRates, game_type, team, color) => {
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
            role: role
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
        role: role
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
      let obj = { tier: "DESCONOCIDO", rank: -1 };
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
      return { value: eloAvg, tier: arr.tier, rank: arr.rank, rankInt: arr.rankInt, division: arr.division, tierFull: arr.tierFull };
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
router.get("/lol/profile/:region/:name/:tag", async (req, env) => {
  const { name, tag } = req.params;
  const { filter } = req.query;
  const region = (req.params.region).toLowerCase();
  let profile_data;
  const rank_profile = [], match_history = [];
  const riot = new riotApi(env.riot_token);
  const route = riot.RegionNameRouting(region);
  if (!route) {
    return new JsonResponse({ status_code: 404, errorName: "region" });
  }
  const cluster = riot.RegionalRouting(region);
  console.log(region, route, cluster);
  const ddversionsFetch = await fetch(`https://ddragon.leagueoflegends.com/realms/${region}.json`);
  const ddversions = await ddversionsFetch.json();
  const account = await riot.getAccountByRiotID(name, tag, cluster);
  const puuid = account.puuid;
  const summoner = await riot.getSummonerDataByPUUID(puuid, route);
  if (account?.status || summoner?.status) {
    return new JsonResponse({ status_code: 404, errorName: "riotId" });
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
      const rank = rankedData.tier !== "MASTER" && rankedData.tier !== "GRANDMASTER" && rankedData.tier !== "CHALLENGER" ? rankedData.rank : "";
      rank_profile.push({
        leagueId: rankedData.leagueId,
        queueType: rankedData.queueType,
        tier: tier,
        rank: rank,
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
  const matchesId = await riot.getMatches(puuid, cluster, 10, riot.queueToId(filter));
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
router.get("/lol/mmr/:region/:name/:tag/:queue", async (req, env) => {
  const { name, tag, queue } = req.params;
  const region = (req.params.region).toLowerCase();
  const riot = new riotApi(env.riot_token);
  const route = riot.RegionNameRouting(region);
  if (!route) {
    return new JsonResponse({ status_code: 404, errorName: "region" });
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
    return new JsonResponse({ status_code: 404, errorName: "riotId" });
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
        const matchesId = await riot.getMatches(puuid, cluster, 3, queueId);
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
            elo_data.avg = { tier: eloTier, rank: eloRank };
            break;
          } else {
            elo_data.avg = { tier: "Desconocido", rank: "Desconocido" };
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

router.get("/rank?", async (req, env) => {
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
  }
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
    await env.AUTH_USERS.put(key, refresh_token, { metadata: { value: refresh_token } });
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
  let imgur_data = (await Promise.all((auth_list.map(async (users_keys) => {
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
    json.push({ id: images.id, title: images.title, description: images.description, datetime: images.datetime, discordUser: discordUser });
  }
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

router.get("/dc/instagram-video-scrapper?", async (req, env, ctx) => {
  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const { query } = req;
  const url = decodeURIComponent(query.url);
  const getInstagramId = (url) => {
    const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories)\/([A-Za-z0-9-_]+)/;
    const match = url.match(regex);
    return match && match[2] ? match[2] : null;
  };

  const idUrl = getInstagramId(url);

  if (!idUrl) {
    console.log("Invalid url");
    return new ErrorResponse(Error.BAD_REQUEST);
  } else {
    try {
      const instagram = new igApi(env.ig_proxy_host);
      const data = await instagram.getMedia(url.includes("/stories") ? url : `https://instagram.com/p/${idUrl}`, idUrl);
      if (!data) return new ErrorResponse(Error.NOT_FOUND);
      data.id = idUrl;

      const response = new JsonResponse(data, { cache: `max-age=${socialsCache.instagram}` });
      ctx.waitUntil(cache?.put(cacheKey, response.clone()));
      return response;
    } catch (e) {
      return new ErrorResponse(Error.NOT_FOUND);
    }
  }
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
      return new ErrorResponse(Error.TOO_MANY_REQUESTS);
    }
    return new JsonResponse({
      video_url: video_url,
      caption: snippet.title,
      short_url: short_url,
      duration: duration,
      status: 200
    });
  } catch (e) {
    console.log(e);
    return new ErrorResponse(Error.NOT_FOUND);
  }
});

router.get("/dc/youtube-video-scrapper?", async (req, env, ctx) => {
  const { url, filter } = req.query;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const youtube = new youtubeApi(env.youtube_token);
  const y2mate = new y2mateApi();
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live)\/|\S*?[?&]v=|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]+)/;
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
      return new ErrorResponse(Error.TOO_MANY_REQUESTS);
    }
    const data = {
      id,
      video_url: video_url,
      caption: snippet.title,
      short_url: short_url,
      duration: duration,
      status: 200
    };

    const response = new JsonResponse(data, { cache: `max-age=${socialsCache.youtube}` });
    ctx.waitUntil(cache?.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    console.log(e);
    return new ErrorResponse(Error.NOT_FOUND);
  }
});

router.get("/dc/facebook-video-scrapper?", async (req, env, ctx) => {
  const { query } = req;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const url = decodeURIComponent(query.url);
  const fdownloader = new fdownloaderApi();
  let video_url;
  const short_url = url.replace(/([&?](?!v=)[^=]+=[^&]*)/g, "").replace("&", "?").replace("www.", "");
  const regex = /(?:watch\?v=|watch\/|gg\/|videos\/|reel\/|reels\/|share\/[\w+]\/)(\w+)/;
  const match = short_url.match(regex);
  const id = match ? match[1] : null;

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

  if (!video_url) new ErrorResponse(Error.NOT_FOUND);

  const data = { id, video_url, short_url, status };
  const response = new JsonResponse(data, { cache: `max-age=${socialsCache.facebook}` });
  ctx.waitUntil(cache?.put(cacheKey, response.clone()));
  return new JsonResponse(data);
});

router.get("/dc/tiktok-video-scrapper?", async (req, env, ctx) => {
  const { query } = req;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const tiktok = new tiktokApi;
  const url = decodeURIComponent(query.url);
  if (url.includes("tiktok.com/")) {
    console.log("es link de tiktok");
    const data = await tiktok.getMedia(url);
    if (!data) new ErrorResponse(Error.NOT_FOUND);

    const response = new JsonResponse(data, { cache: `max-age=${socialsCache.tiktok}` });
    ctx.waitUntil(cache?.put(cacheKey, response.clone()));
    return response;
  } else {
    return new JsResponse("Url no válida");
  }
});

router.get("/dc/x-video-scrapper?", async (req, env, ctx) => {
  const { query } = req;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const url = decodeURIComponent(query.url);
  if (url.includes("twitter.com/") || url.includes("x.com/") || url.includes("t.co/")) {
    console.log("es link de X");
    const twitter = new twitterApi(env.twitter_bearer_token, env.x_cookie);
    const tco = url.includes("t.co/") ? (await $fetch(url, { headers: { "User-Agent": randUA("desktop") } }).catch(() => null)).match(/location\.replace\("([^"]+)"\)/)[1] : null;
    const result = await twitter.getTweet(tco?.replace(/\\/g, "") || url);
    if (!result) return new ErrorResponse(Error.NOT_FOUND);

    const response = new JsonResponse(result, { cache: `max-age=${socialsCache.twitter}` });
    ctx.waitUntil(cache?.put(cacheKey, response.clone()));
    return response;
  }
  console.log("no es link de X");
  return new JsResponse("Url no válida");
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
    apiKey: env.openai_token
  });
  const IA = async () => {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `Translate this words into 1. English\n${prompt.replace(/black/gi, "dark")}\n1. `,
      temperature: 0.6,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
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
        key: key,
        model_id: "anything-v5",
        prompt: translatedPrompt.replace(/black/gi, "dark") + extra_prompt,
        negative_prompt: "boring, bad art, (extra fingers), out of frame, mutated hands, poorly drawn hands, poorly drawn face, deformed, disfigured, ugly, blurry, bad anatomy, bad proportions, ((extra limbs)), cloned face, skinny, glitchy, (double torso), (double body), ((extra arms)), ((extra hands)), mangled fingers, missing lips, ugly face, distorted face, extra legs, watermark" + extra_negative_prompt,
        width: "816",
        height: "816",
        samples: "1",
        enhance_prompt: "no",
        num_inference_steps: "30",
        seed: null,
        guidance_scale: "7.5",
        safety_checker: "no",
        multi_lingual: "yes",
        webhook: null,
        track_id: null
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
        let imgur_url = (await Promise.all((auth_list.map(async (users_keys) => {
          if (imgur_user == users_keys.name) {
            const { access_token } = await imgur.RefreshToken(users_keys.metadata.value);
            const respuesta = await imgur.UploadImage(access_token, prompt, fetched.output[0], "Stable Diffusion: Anything-v5");
            const imgurl = respuesta.data.link;
            console.log(imgurl);
            return imgurl;
          }
        })))).filter(users_keys => users_keys);
        console.log("subido a imgur");
        return { output: [imgur_url] };
      } else {
        console.log("error");
        return { output: ["error"] };
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
          key: key,
          request_id: id
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
    return new JsonResponse({ status_code: 404, errorName: "region" });
  }
  const cluster = riot.RegionalRouting(region);
  const account = await riot.getAccountByRiotID(name, tag, cluster);
  const puuid = account.puuid;
  const summoner = await riot.getSummonerDataByPUUID(puuid, route);
  if (account?.status || summoner?.status) {
    return new JsonResponse({ status_code: 404, errorName: "riotId" });
  }
  const ddversions = await fetch(`https://ddragon.leagueoflegends.com/realms/${region}.json`);
  const ddversions_data = await ddversions.json();
  const champion_list = await fetch(`https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.champion}/data/es_MX/champion.json`);
  const champion_data = await champion_list.json();
  const icon = `https://ddragon.leagueoflegends.com/cdn/${ddversions_data.n.profileicon}/img/profileicon/${summoner.profileIconId}.png`;
  const masteriesData = await riot.getChampionMasteriesByPUUID(puuid, route, 10);
  if (masteriesData?.status) {
    return new JsonResponse({ status_code: 404, errorName: "mastery" });
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

router.get("/dc/twitch-video-scrapper?", async (req, env, ctx) => {
  const { query } = req;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const url = decodeURIComponent(query.url);
  const id = obtenerIDDesdeURL(url);
  const twitch = new twitchGQL();
  try {
    const data = await twitch.getClip(id);
    console.log(data);
    const response = new JsonResponse(data, { cache: `max-age=${socialsCache.twitch}` });
    ctx.waitUntil(cache?.put(cacheKey, response.clone()));
    return response;
  } catch (e) {
    console.log(e);
    return new ErrorResponse(Error.NOT_FOUND);
  }
});

router.get("/kick/clip/:id", async (req, env) => {
  const { id } = req.params;
  const { clipId } = await $fetch(`${env.kick_3rd_base}/clip/${id}`).catch(() => null);
  if (!clipId) new ErrorResponse(Error.NOT_FOUND);
  const url = `https://clips.kick.com/tmp/${id}.mp4`;
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
    return new JsResponse(`${gameName} #${tagLine} ${soloq ? `| ${soloq}` : ""} ${flex ? `| ${flex}` : ""} ${!soloq && !flex ? "| Unranked" : ""}`);
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
  return new JsResponse(`${gameName} #${tagLine} ${soloq ? `| ${soloq}` : ""} ${flex ? `| ${flex}` : ""} ${!soloq && !flex ? "| Unranked" : ""}`);
});

router.get("/twitch/subscribers/:user/total", async (req, env) => {
  const { user } = req.params;
  let total;
  let attempts = 0;

  while (!total && attempts < 4) {
    if (attempts > 0) await new Promise(r => setTimeout(r, 1000));
    try {
      const response = await fetch(`https://twitchtracker.com/${user}/subscribers`, {
        headers: {
          "User-Agent": randUA("desktop")
        }
      });
      const html = await response.text();
      const $ = load(html);
      const divSubs = $(".g-x-s-label.color-gold");
      const firstSpan = divSubs.parent().find("span").first();
      total = firstSpan.text();
      console.log(total);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    attempts++;
  }

  return new JsonResponse({ total });
});

router.get("/dc/kick-video-scrapper?", async (req, env, ctx) => {
  const { query } = req;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const kick = new kickApi();
  const data = await kick.getMedia(decodeURIComponent(query.url));
  if (!data) return new ErrorResponse(Error.NOT_FOUND);
  const response = new JsonResponse(data, { cache: `max-age=${socialsCache.kick}` });

  ctx.waitUntil(cache?.put(cacheKey, response.clone()));
  return response;
});

router.get("/dc/reddit-video-scrapper?", async (req, env, ctx) => {
  const { query } = req;

  const cacheKey = new Request(req.url, req);
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  const reddit = new redditApi(env.reddit_token);
  const data = await reddit.getMedia(decodeURIComponent(query.url));
  if (!data) return new ErrorResponse(Error.NOT_FOUND);
  const response = new JsonResponse(data, { cache: `max-age=${socialsCache.reddit}` });

  ctx.waitUntil(cache?.put(cacheKey, response.clone()));
  return response;
});

router.get("/dc/fx?", async (req, env, ctx) => {
  const { query } = req;
  if (query.video_url && query.redirect_url) {
    const cacheKey = new Request(req.url, req);
    const cache = caches.default;

    const cachedResponse = await cache.match(cacheKey);
    if (cachedResponse) {
      console.log("Found in cache!");
      return cachedResponse;
    }

    const video_url = withQuery(query.video_url, { t: Date.now() });
    const checkCdn = await $fetch.raw(video_url).catch(() => null);
    if (!checkCdn?.ok) return new ErrorResponse(Error.NOT_FOUND);

    const html = `
      <meta charset="UTF-8">
      <meta http-equiv="refresh" content="0;url=${query?.redirect_url}"/>
      <meta name="twitter:player:stream" content="${video_url}"/>
      <meta name="twitter:player:stream:content_type" content="video/mp4"/>
      <meta property="twitter:card" content="player"/>
      <meta property="twitter:image" content="0"/>
      <meta property="og:type" content="video"/>
      <meta property="og:url" content="${query?.redirect_url}"/>
      <meta property="og:video" content="${video_url}"/>
      <meta property="og:video:url" content="${video_url}"/>
      <meta property="og:video:secure_url" content="${video_url}"/>
      <meta property="og:video:type" content="video/mp4"/>
    `.replace(/\n\s+/g, "\n");
    const response = new CustomResponse(html, { type: "text/html; charset=UTF-8", cache: "max-age=432000" });

    console.info("Stored in cache!");
    ctx.waitUntil(cache?.put(cacheKey, response.clone()));

    return response;
  }

  return new ErrorResponse(Error.BAD_REQUEST);
});

router.all("*", () => new ErrorResponse(Error.NOT_FOUND));

export default {
  async fetch (req, env, ctx) {
    return router.fetch(req, env, ctx);
  },
  async scheduled (event, env, ctx) {
    switch (event.cron) {
      case "*/3 * * * *":
        await lolChampTagAdder(env);
        break;
    }
  }
};
