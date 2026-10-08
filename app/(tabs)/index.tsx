import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pesquisar</Text>
      <Text style={styles.subtitle}>regiões administrativas do DF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f1f5f9', // slate-100
  },
  title: {
    marginLeft: 16,
    marginTop: 12,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1e293b', // slate-800
  },
  subtitle: {
    marginLeft: 16,
    fontSize: 16,
    color: '#9ca3af', // gray-400
  },
});