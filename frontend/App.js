import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEcoClima } from './src/hooks/useEcoClima';
import RoomCard from './src/components/RoomCard';
import DetailScreen from './src/components/DetailScreen';

const Stack = createNativeStackNavigator();
const API_URL = 'http://192.168.5.164:8000/api/sensors'; // Ajusta con tu IP local

function HomeScreen({ navigation }) {
  const { data, loading, error, mutate } = useEcoClima(3000);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  const handleAddRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Escribe un nombre válido para el salón');
      return;
    }
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: newRoomName.trim(), temperature: 22.0, humidity: 50.0, co2: 600 }),
      });
      if (response.ok) {
        setNewRoomName('');
        setModalVisible(false);
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo crear el salón');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Panel Multi-Espacio</Text>
          <Text style={styles.headerSubtitle}>EcoClima - Gestión Dinámica</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {loading && !data ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : error ? (
          <Text style={styles.errorText}>Error conectando al servidor: {error}</Text>
        ) : data && Object.keys(data).length > 0 ? (
          Object.keys(data).map((roomName) => (
            <RoomCard 
              key={roomName} 
              roomName={roomName} 
              metrics={data[roomName]} 
              onPress={() => navigation.navigate('Detalle', { roomName, metrics: data[roomName] })}
            />
          ))
        ) : (
          <Text style={styles.noDataText}>No hay salones activos. Pulsa ＋ arriba para agregar uno.</Text>
        )}
      </ScrollView>

      {/* Modal para Agregar Salón */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nuevo Salón</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. Sala de Conferencias" 
              placeholderTextColor="#999"
              value={newRoomName}
              onChangeText={setNewRoomName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleAddRoom}>
                <Text style={styles.btnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2C3E50' }, headerTintColor: '#FFF' }}>
        <Stack.Screen name="Inicio" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Detalle" component={DetailScreen} options={({ route }) => ({ title: route.params.roomName })} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#2C3E50', padding: 20, paddingTop: 40, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, color: '#FFF', fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, color: '#BDC3C7', marginTop: 3 },
  addButton: { backgroundColor: '#27AE60', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: -2 },
  container: { padding: 20 },
  errorText: { color: '#F44336', textAlign: 'center', marginTop: 20, fontSize: 16 },
  noDataText: { textAlign: 'center', color: '#777', marginTop: 40, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFF', width: '85%', padding: 25, borderRadius: 12, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50', marginBottom: 15 },
  input: { borderWidth: 1, borderColor: '#BDC3C7', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20, color: '#333' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  cancelBtn: { backgroundColor: '#95A5A6' },
  saveBtn: { backgroundColor: '#27AE60' },
  btnText: { color: '#FFF', fontWeight: 'bold' }
});