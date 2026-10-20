import type { Regiao } from '@/types/models';
// Initial navigation catalog, not an exhaustive list of the DF administrative regions.
// There are no fabricated prices, ratings, safety scores or demographic indicators.
export const REGIOES: Regiao[] = [
  {
    id: 'plano-piloto',
    nome: 'Plano Piloto',
    subtitulo: 'Explore o dia a dia e converse com a comunidade.',
  },
  { id: 'ceilandia', nome: 'Ceilândia', subtitulo: 'Troque dicas e experiências sobre a região.' },
  {
    id: 'taguatinga',
    nome: 'Taguatinga',
    subtitulo: 'Encontre conversas e descubra novas perspectivas.',
  },
  {
    id: 'aguas-claras',
    nome: 'Águas Claras',
    subtitulo: 'Compartilhe suas descobertas com outros moradores.',
  },
  { id: 'guara', nome: 'Guará', subtitulo: 'Conheça a região pelo olhar da comunidade.' },
  { id: 'gama', nome: 'Gama', subtitulo: 'Pergunte, participe e conte sua experiência.' },
];
