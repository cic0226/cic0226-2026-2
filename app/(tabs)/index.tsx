import { Image } from 'expo-image';
import { Platform, StyleSheet, TextInput } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

export default function HomeScreen() {
return (
    <div className="w-full h-full bg-slate-100 grid grid-cols-1 grid-rows-[auto_1fr]">
      <div className="ml-4 mt-3 text-4xl font-bold text-slate-800 w-full">
          Pesquisar
      </div>
      <div className="ml-4 text-md text-gray-400">
        regioes administrativas de DF
      </div>
    </div>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
