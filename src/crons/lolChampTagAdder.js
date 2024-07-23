import jp from "jsonpath";
import riotApi from "../apis/riotApi";
import twitchApi from "../apis/twitchApi";
import { SettedTwitchTagsResponse } from "../utils/helpers";

export const lolChampTagAdder = async (env) => {
  const channelId = "491738569";
  const riot = new riotApi(env.riot_token);
  const twitch = new twitchApi(env.client_id, env.client_secret);
  const region = riot.RegionNameRouting("las");
  const { participants } = await riot.LiveGameData(env.zihnee_lol_id_las, region);
  const champion_data = await fetch("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/es_mx/v1/champion-summary.json");
  const data = await champion_data.json();
  const channelInfo = await twitch.getBroadcasterInfo(channelId);
  const tags = channelInfo.tags;
  const tags_length = tags.length;
  const coincidencia = tags.some(elem => jp.query(data, "$..[?(@.name)].alias").includes(elem)); // true or false
  const coincidencia_name = tags.filter(elem => jp.query(data, "$..[?(@.name)].alias").includes(elem)); // Champ name coincidencia en tags y champion data
  const filteredTags = tags.filter(elem => elem !== String(coincidencia_name));
  if (participants == undefined) {
    if (coincidencia) {
      console.log("Hay coincidencia y no está en partida, se quita el tag coincidente: " + coincidencia_name);
      const auth_list = (await env.AUTH_USERS.list()).keys;
      console.log(filteredTags);
      const log = await SettedTwitchTagsResponse(env, channelId, auth_list, filteredTags, tags_length);
      console.log(log);
    } else {
      console.log("No hay coincidencia y no está en partida. No se actualiza los tags de twitch. No hay fetch");
      const log = String(filteredTags);
      console.log(log);
    }
  } else {
    for await (const participant of participants) {
      if (participant.summonerId == env.zihnee_lol_id_las) {
        const championId = participant.championId;
        const champion_name = String(jp.query(data, `$..[?(@.id==${championId})].alias`));
        console.log(champion_name);
        if (coincidencia) {
          console.log(`Hay coincidencia, hay campeon en los tags: ${coincidencia_name}`);
          tags.splice(tags.indexOf(String(coincidencia_name)), 1, champion_name.split());
          if (champion_name == String(coincidencia_name)) {
            console.log("Es el mismo campeón. No se actualiza");
            const log = String(tags);
            console.log(log);
          } else {
            console.log("No es el mismo campeón. Se actualiza");
            const auth_list = (await env.AUTH_USERS.list()).keys;
            const log = await SettedTwitchTagsResponse(env, channelId, auth_list, tags, tags_length);
            console.log(log);
          }
        } else {
          console.log("No hay coincidencia, no hay campeon en los tags. Se actualiza.");
          if (tags.length < 10) {
            console.log("Menos de 10 tags.");
            tags.unshift(champion_name);
          } else {
            console.log("10 tags");
            if (tags[tags.length - 1] !== "Español") {
              tags.pop();
            } else {
              tags.splice(tags.length - 2, 1);
            }
            tags.unshift(champion_name);
          }
          const auth_list = (await env.AUTH_USERS.list()).keys;
          const log = await SettedTwitchTagsResponse(env, channelId, auth_list, tags, tags_length);
          console.log(log);
        }
      }
    }
  }
};