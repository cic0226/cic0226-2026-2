import type { IconName } from '@/components/ui';
export interface ContentPage {
  title: string;
  eyebrow: string;
  icon: IconName;
  intro: string;
  sections: { title: string; text: string }[];
}
export const CONTENT: Record<string, ContentPage> = {
  seguranca: {
    title: 'Segurança',
    eyebrow: 'PARA SABER MAIS',
    icon: 'shield-checkmark-outline',
    intro: 'Conheça a rotina de uma região antes de decidir.',
    sections: [
      {
        title: 'Observe em diferentes horários',
        text: 'Durante sua visita, observe iluminação, movimento de pessoas e os trajetos que fariam parte da sua rotina.',
      },
      {
        title: 'Converse com a comunidade',
        text: 'Pergunte como é circular na região e compare diferentes experiências. Relatos pessoais não substituem dados oficiais nem representam todas as ruas.',
      },
      {
        title: 'Indicadores oficiais',
        text: 'Esta primeira entrega ainda não integra indicadores oficiais. Nenhuma nota de segurança é calculada pelo aplicativo.',
      },
    ],
  },
  transporte: {
    title: 'Transporte',
    eyebrow: 'PARA SABER MAIS',
    icon: 'bus-outline',
    intro: 'Pense nos deslocamentos que fazem parte do seu dia.',
    sections: [
      {
        title: 'Desenhe sua rotina',
        text: 'Liste seus destinos frequentes: trabalho, estudo, saúde e lazer. Compare opções de deslocamento a partir da região desejada.',
      },
      {
        title: 'Experimente o trajeto',
        text: 'Observe a caminhada até o ponto ou estação, os horários e a acessibilidade. Confirme linhas e tarifas nos canais oficiais antes de viajar.',
      },
    ],
  },
  lazer: {
    title: 'Lazer',
    eyebrow: 'PARA SABER MAIS',
    icon: 'sunny-outline',
    intro: 'Encontre espaço para o que faz bem a você.',
    sections: [
      {
        title: 'Quais lugares combinam com você?',
        text: 'Pense em atividades ao ar livre, cultura, esporte e encontros. Pergunte no fórum pelas experiências de outras pessoas.',
      },
      {
        title: 'Planeje a visita',
        text: 'Confirme horários, acesso e condições diretamente com o local. Publicações da comunidade podem ficar desatualizadas.',
      },
    ],
  },
  custo: {
    title: 'Custo de vida',
    eyebrow: 'PARA SABER MAIS',
    icon: 'wallet-outline',
    intro: 'Organize uma lista de despesas para comparar suas opções.',
    sections: [
      {
        title: 'Liste os itens do seu dia a dia',
        text: 'Inclua moradia, contas de consumo, alimentação, transporte e necessidades pessoais. Preencha com valores que você mesmo verificou.',
      },
      {
        title: 'Compare sem generalizar',
        text: 'O aplicativo ainda não possui uma base de preços. As experiências compartilhadas no fórum não são estimativas oficiais de custo de vida.',
      },
    ],
  },
  guia: {
    title: 'Seu primeiro lugar',
    eyebrow: 'MORANDO SOZINHO',
    icon: 'key-outline',
    intro: 'Um roteiro inicial para organizar a mudança, no seu ritmo.',
    sections: [
      {
        title: 'Antes de escolher',
        text: 'Liste suas prioridades, os deslocamentos diários e as despesas que precisam caber na sua rotina. Visite o lugar e registre suas dúvidas.',
      },
      {
        title: 'Antes de mudar',
        text: 'Organize documentos, contatos e datas. Confira com os responsáveis os procedimentos de entrada e registre o estado do imóvel.',
      },
      {
        title: 'Nos primeiros dias',
        text: 'Priorize itens essenciais, conheça os serviços próximos e construa sua rede de apoio. Compartilhe descobertas sem divulgar seu endereço completo.',
      },
    ],
  },
  passeios: {
    title: 'Passeios no DF',
    eyebrow: 'EXPLORE NOVOS CAMINHOS',
    icon: 'compass-outline',
    intro: 'O próximo passeio pode começar com uma boa conversa.',
    sections: [
      {
        title: 'Peça uma dica',
        text: 'No fórum, escolha a categoria Lazer e conte qual tipo de passeio você procura. A comunidade pode compartilhar suas experiências.',
      },
      {
        title: 'Confira antes de sair',
        text: 'Verifique os horários de funcionamento, as condições de acesso e a previsão do tempo nos canais responsáveis. Não há agenda de eventos integrada nesta entrega.',
      },
    ],
  },
  ajuda: {
    title: 'Ajuda e suporte',
    eyebrow: 'SOBRE ESTA VERSÃO',
    icon: 'help-circle-outline',
    intro: 'O Mapeei aproxima pessoas e experiências sobre o DF.',
    sections: [
      {
        title: 'Como iniciar uma conversa?',
        text: 'Abra uma publicação e toque no nome ou na foto do autor. O chat é entre você e essa pessoa. Suas conversas ficam na tela Mensagens.',
      },
      {
        title: 'Como alterar minha foto?',
        text: 'Acesse Perfil, depois Editar perfil. Selecione uma imagem e toque em Salvar alterações. A foto é compactada antes de ser enviada.',
      },
      {
        title: 'Não consigo enviar',
        text: 'Verifique a internet. O responsável pelo projeto precisa publicar as regras e os índices enviados no pacote. Um bloqueio entre participantes também impede novas mensagens.',
      },
      {
        title: 'Limites desta entrega',
        text: 'Não há login Google/Apple, notificação push, chamadas ou anexos no chat. O conteúdo editorial é inicial e não substitui informações oficiais.',
      },
    ],
  },
};
