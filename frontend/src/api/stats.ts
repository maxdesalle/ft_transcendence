import { LadderDto, MatchDTO, PlayerStatsDto } from '../types/stats.interface';
import { api } from '../utils/api';
import { routes } from './utils';

export const getAllMatches = async () => {
  const res = await api.get<MatchDTO[]>(routes.matches);
  return res.data;
};

export const getLadder = async () => {
  const res = await api.get<LadderDto[]>(routes.ladder);
  return res.data;
};

export const getPlayerStats = async (id: number) => {
  const res = await api.get<PlayerStatsDto>(`${routes.playerStats}/${id}`);
  return res.data;
};
