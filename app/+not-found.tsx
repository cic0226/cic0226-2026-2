import { router } from 'expo-router';
import { Button, Empty, Page } from '@/components/ui';
export default function NotFoundScreen() {
  return (
    <Page>
      <Empty
        icon="compass-outline"
        title="Este caminho não existe"
        text="Volte para o início e continue explorando."
        action={<Button title="Ir para o início" onPress={() => router.replace('/')} />}
      />
    </Page>
  );
}
