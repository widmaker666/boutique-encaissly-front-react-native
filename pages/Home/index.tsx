import { View, Text, TouchableOpacity, Image } from 'react-native'
import { router } from 'expo-router'
import { styles } from '@/styles/pages/home.style'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/icon.png')} style={styles.logo} />
      <Text style={styles.titre}>Encaissly</Text>
      <Text style={styles.pitch}>La caisse intelligente des boutiques de créateurs</Text>
      <Text style={styles.description}>
        Gérez vos ventes, suivez les commissions de chaque créatrice et gardez une vue claire sur votre boutique — depuis votre téléphone.
      </Text>

      <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(auth)/login')}>
        <Text style={styles.btnPrimaryText}>Se connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.btnSecondaryText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  )
}