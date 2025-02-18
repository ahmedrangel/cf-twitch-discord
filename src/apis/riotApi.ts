import { $fetch } from "ofetch";
import { regionRoutes, regionClusters, tiers, ranks, specialTiers, queueMap, queueOptions, eloValues } from "../utils/leagueoflegends";

class riotApi {
  private riot_token: string;
  private domain: string;
  public route: string;
  public cluster: string;
  constructor (options: { token: string, region: string }) {
    this.riot_token = options.token;
    this.domain = "api.riotgames.com";

    const regionName = regionRoutes[options.region.toLowerCase()];
    if (!regionName) throw new Error("Region route not found");
    this.route = regionName;

    for (const [cluster, regions] of Object.entries(regionClusters)) {
      if (regions.includes(options.region)) {
        this.cluster = cluster;
        return;
      }
    }
    throw new Error("Region cluster not found");
  }

  get regionEndpoint () {
    return `https://${this.route}.${this.domain}`;
  }

  get clusterEndpoint () {
    return `https://${this.cluster}.${this.domain}`;
  }

  async getSummonerDataByPUUID (puuid: string) {
    return $fetch(`${this.regionEndpoint}/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${this.riot_token}`).catch(() => null);
  }

  async getAccountByRiotID (name: string, tag: string) {
    return $fetch(`${this.clusterEndpoint}/riot/account/v1/accounts/by-riot-id/${name}/${tag}?api_key=${this.riot_token}`).catch(() => null);
  }

  async SummonerDataByName (summoner: string) {
    return $fetch(`${this.regionEndpoint}/lol/summoner/v4/summoners/by-name/${summoner}?api_key=${this.riot_token}`).catch(() => null);
  }

  async LiveGameData (puuid: string) {
    return $fetch(`${this.regionEndpoint}/lol/spectator/v5/active-games/by-summoner/${puuid}?api_key=${this.riot_token}`).catch(() => null);
  }

  async RankedData (summoner_id: string) {
    return $fetch(`${this.regionEndpoint}/lol/league/v4/entries/by-summoner/${summoner_id}?api_key=${this.riot_token}`).catch(() => null);
  }

  async getMatches (puuid: string, count: number, queueId: number) {
    return $fetch(`${this.clusterEndpoint}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${this.riot_token}&queue=${queueId ? queueId : ""}`).catch(() => null);
  }

  async getMatchFromId (matchId: string) {
    return $fetch(`${this.clusterEndpoint}/lol/match/v5/matches/${matchId}?api_key=${this.riot_token}`).catch(() => null);
  }

  async getChellengesData (puuid: string) {
    return $fetch(`${this.regionEndpoint}/lol/challenges/v1/player-data/${puuid}?api_key=${this.riot_token}`).catch(() => null);
  }

  async getChampionMasteries (summoner_id: string, count: number) {
    return $fetch(`${this.regionEndpoint}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summoner_id}/top?count=${count}&api_key=${this.riot_token}`).catch(() => null);
  }

  async getChampionMasteryScore (summoner_id: string) {
    return $fetch(`${this.regionEndpoint}/lol/champion-mastery/v4/scores/by-summoner/${summoner_id}?api_key=${this.riot_token}`).catch(() => null);
  }

  async getChampionMasteriesByPUUID (summoner_puuid: string, count: number) {
    return $fetch(`${this.regionEndpoint}/lol/champion-mastery/v4/champion-masteries/by-puuid/${summoner_puuid}/top?count=${count}&api_key=${this.riot_token}`).catch(() => null);
  }

  async getChampionMasteryScoreByPUUID (summoner_puuid: string) {
    return $fetch(`${this.regionEndpoint}/lol/champion-mastery/v4/scores/by-puuid/${summoner_puuid}?api_key=${this.riot_token}`).catch(() => null);
  }

  tierCase (option: string) {
    return tiers[option];
  }

  rankCase (option: string) {
    return ranks[option];
  }

  divisionCase (tier: string, rank: string) {
    return specialTiers.includes(tier) ? tier : tier + rank;
  }

  queueCase (option: number) {
    return queueMap[option] || { profile_rank_type: "RANKED_SOLO_5x5", queue_name: "", full_name: "", short_name: "", queue: "" };
  }

  queueToId (queue: string) {
    return queueOptions[queue?.toLowerCase()] || null;
  }

  championRole (id, merakiRates) {
    const rates = merakiRates.data[id];
    const propertyName = Object.keys(rates).reduce((maxProperty, currentProperty) => {
      return rates[currentProperty].playRate > rates[maxProperty].playRate ? currentProperty : maxProperty;
    }, Object.keys(rates)[0]);
    return propertyName;
  }

  fixJsonJungleSort (array) {
    const index = array.findIndex(item => item.spell1Id === 11 || item.spell2Id === 11);
    if (index !== -1) {
      const itemToMove = array.splice(index, 1)[0];
      array.splice(1, 0, itemToMove);
    }
    return array;
  }

  get eloValues () {
    return eloValues;
  }
}

export default riotApi;
